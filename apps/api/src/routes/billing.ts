import { Hono } from "hono";
import Stripe from "stripe";
import { z } from "zod";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { db, subscription, user, stripeWebhookEvent } from "@focusflow/db";
import { eq, sql } from "drizzle-orm";
import {
  getStripe,
  getWebhookSecret,
  resolvePriceId,
  lookupKeyFor,
  type Plan,
} from "../lib/stripe";
import { env } from "../lib/env";
import { log } from "../lib/safe-logger";
import { sendEmail } from "../lib/email";
import { trialEndingReminderTemplate } from "../lib/email-templates";
import { recordServerEvent } from "../lib/analytics-events";

// After this many failed processing attempts on the same Stripe event,
// stop returning 500 (which makes Stripe retry for ≥3 days) and instead
// quarantine the event with a 200 ack + warn log. Surfaces as a manual-
// review item in the SRE runbook rather than a PagerDuty storm.
const MAX_WEBHOOK_ATTEMPTS = 5;

// Stripe Checkout supports a fixed set of locales; we whitelist the two we
// actually ship in the app so a stray header can't push an unsupported
// value into the request and trigger a Stripe 400.
const CHECKOUT_LOCALES = ["fr", "en"] as const;
const checkoutBodySchema = z.object({
  plan: z.enum(["monthly", "annual"]).optional(),
  locale: z.enum(CHECKOUT_LOCALES).optional(),
});

function intervalFromStripe(
  stripeSub: Stripe.Subscription,
): "month" | "year" | null {
  const raw = stripeSub.items.data[0]?.price.recurring?.interval;
  return raw === "month" || raw === "year" ? raw : null;
}

const checkoutLimiter = rateLimiter({
  namespace: "billing-checkout",
  windowMs: 60_000,
  limit: 5,
  keyBy: "user",
});

const portalLimiter = rateLimiter({
  namespace: "billing-portal",
  windowMs: 60_000,
  limit: 10,
  keyBy: "user",
});

function getPeriodEnd(stripeSub: Stripe.Subscription): Date {
  // Stripe's 2024+ API moved `current_period_end` onto the subscription
  // *item*; the top-level field is kept for back-compat but only set on
  // single-item subs. Read item-level first, fall back to top-level, and
  // refuse to silently fabricate a window if neither is present — a
  // malformed payload should fail loud (Stripe will retry) rather than
  // grant a free month of premium.
  //
  // Note: we deliberately do NOT fall back to `billing_cycle_anchor` —
  // that is the *start* of the cycle, not the end, and would write a
  // past-dated `currentPeriodEnd` for incomplete or freshly-paused subs.
  const itemEnd = (
    stripeSub.items.data[0] as unknown as { current_period_end?: number }
  )?.current_period_end;
  const topEnd = (stripeSub as unknown as { current_period_end?: number })
    .current_period_end;
  const ts = itemEnd ?? topEnd;
  if (!ts) {
    throw new Error("Stripe subscription missing period end timestamp");
  }
  return new Date(ts * 1000);
}

// Resolve the userId for a Stripe customerId via the persisted
// `user.stripeCustomerId` mapping (written at /checkout time, before any
// Customer is created on Stripe's side).
//
// We deliberately do NOT fall back to `Customer.metadata.userId`: that
// field is editable from the Stripe Billing Portal and any path that
// calls `customers.update`, so trusting it would let a paying customer
// who edits their metadata to a victim's userId hijack that user's
// subscription row — and the previous implementation also backfilled
// `user.stripeCustomerId`, persisting the takeover. If a customer ever
// pre-dates the mapping, fix it via a one-off backfill, not by trusting
// attacker-controllable input on the hot path.
async function resolveUserIdFromCustomer(
  customerId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.stripeCustomerId, customerId))
    .limit(1);
  return row?.id ?? null;
}

export const billingRoutes = new Hono<AppEnv>();

// Checkout session creation — requires auth
billingRoutes.post("/checkout", authMiddleware, checkoutLimiter, async (c) => {
  const currentUser = c.get("user");

  // Annual is the default — better LTV for us, ~35% off for the parent.
  // Monthly stays available via { plan: "monthly" } for those who want the
  // shorter commitment.
  const body = await c.req.json().catch(() => ({}));
  const parsed = checkoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "Données invalides",
        code: "VALIDATION_FAILED",
        details: parsed.error.flatten(),
      },
      422,
    );
  }
  const plan: Plan = parsed.data.plan ?? "annual";
  const locale = parsed.data.locale ?? "fr";

  // Find or create Stripe customer.
  //
  // Source of truth is `user.stripeCustomerId`, populated AT customer-create
  // time (not at first paid invoice via webhook). Without this, an abandoned
  // checkout would leak a fresh Stripe Customer on every retry — issue #103
  // "Orphan Stripe customers". The `user.stripeCustomerId` unique constraint
  // also guards against double-create races between two parallel /checkout
  // calls.
  let stripeCustomerId: string;
  const [userRow] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (userRow?.stripeCustomerId) {
    stripeCustomerId = userRow.stripeCustomerId;
  } else {
    // Idempotency key keyed by userId: two concurrent /checkout calls
    // (double-click, reload race, retried fetch) would otherwise both
    // miss the cached `user.stripeCustomerId` and create two Stripe
    // Customers — the unique DB constraint stops the second write but
    // the orphan Customer survives in Stripe forever. With this header
    // Stripe returns the SAME Customer for any subsequent retry within
    // 24 h, eliminating the leak. Issue #103 P1.
    const customer = await getStripe().customers.create(
      {
        email: currentUser.email,
        name: currentUser.name,
        metadata: { userId: currentUser.id },
      },
      { idempotencyKey: `customer:${currentUser.id}` },
    );
    stripeCustomerId = customer.id;
    await db
      .update(user)
      .set({ stripeCustomerId })
      .where(eq(user.id, currentUser.id));
  }

  const priceId = await resolvePriceId(lookupKeyFor(plan));

  const session = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    client_reference_id: currentUser.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 14,
    },
    // Business rule C1: start the 14-day trial without collecting a card.
    // Stripe will prompt for payment before the trial ends via reminder emails.
    payment_method_collection: "if_required",
    success_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/dashboard?billing=success`,
    cancel_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/#tarifs`,
    locale,
  });

  return c.json({ url: session.url });
});

// Subscription status — requires auth
billingRoutes.get("/status", authMiddleware, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub) {
    return c.json({ status: "none", active: false });
  }

  // Surface the paused window so the frontend can render a distinct
  // "paused / Reprendre l'abonnement" state instead of conflating it
  // with a healthy active sub. Stripe leaves `status === "active"` while
  // pause_collection is set, so paused-ness is only legible via
  // `pausedUntil`.
  const now = new Date();
  const paused = sub.pausedUntil != null && sub.pausedUntil > now;

  return c.json({
    status: sub.status,
    active: sub.status === "active" || sub.status === "trialing",
    paused,
    pausedUntil: paused ? sub.pausedUntil : null,
    // Surface the scheduled-cancellation window so the frontend can
    // render a distinct "Annulation programmée — Réactiver" branch.
    // Stripe leaves status="active" until the period actually lapses,
    // so this flag is the only legible signal that a cancel is pending.
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    planId: sub.planId,
    interval: sub.interval,
    currentPeriodEnd: sub.currentPeriodEnd,
  });
});

// Customer portal — requires auth
billingRoutes.post("/portal", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeCustomerId) {
    return c.json(
      { error: "Aucun abonnement trouvé", code: "SUBSCRIPTION_NOT_FOUND" },
      404,
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/account`,
    // Restricts the portal to Tokō Premium products. Without a config
    // a customer would see WAWPTN / The Box / CoproPilot prices in the
    // "switch plan" picker — they share the same Stripe account.
    ...(env.STRIPE_PORTAL_CONFIG_ID
      ? { configuration: env.STRIPE_PORTAL_CONFIG_ID }
      : {}),
  });

  return c.json({ url: session.url });
});

// Business rule C2: one-click cancellation. Schedules the Stripe subscription
// to cancel at the end of the current period so the user keeps what they paid
// for, and the webhook will sync status back. Reversible via /resume.
billingRoutes.post("/cancel", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeSubscriptionId) {
    return c.json(
      { error: "Aucun abonnement trouvé", code: "SUBSCRIPTION_NOT_FOUND" },
      404,
    );
  }

  const updated = await getStripe().subscriptions.update(
    sub.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );

  // Mirror Stripe's response into our row immediately. Without this, the
  // UI shows stale state until the corresponding webhook arrives — most
  // visibly the new currentPeriodEnd if a renewal date was rescheduled.
  // Issue #103 "DB drift after /cancel". `cancelAtPeriodEnd` is also
  // persisted so /status can render the "Annulation programmée" branch
  // before any webhook arrives.
  await db
    .update(subscription)
    .set({
      status: updated.status,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      currentPeriodEnd: getPeriodEnd(updated),
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, sub.id));

  return c.json({
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    status: updated.status,
  });
});

// Reverses both /cancel (cancel_at_period_end) and /pause (pause_collection)
// in one call so the frontend can offer a single "resume" action regardless
// of which state the subscription is in. Mirrors the cleared pause into the
// DB; the annual quota counter is intentionally NOT refunded.
billingRoutes.post("/resume", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeSubscriptionId) {
    return c.json(
      { error: "Aucun abonnement trouvé", code: "SUBSCRIPTION_NOT_FOUND" },
      404,
    );
  }

  const updated = await getStripe().subscriptions.update(
    sub.stripeSubscriptionId,
    {
      cancel_at_period_end: false,
      pause_collection: "",
    },
  );

  // Always mirror cancelAtPeriodEnd back to false — the previous version
  // only cleared `pausedUntil`, leaving the persisted cancelAtPeriodEnd
  // flag stale and causing the UI to keep showing "Annulation programmée"
  // until the webhook caught up.
  await db
    .update(subscription)
    .set({
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      pausedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, sub.id));

  return c.json({
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    status: updated.status,
    pausedUntil: null,
  });
});

// Business rule C3: free pause up to 3 months per calendar year.
// Body: { months: 1 | 2 | 3 }. Remaining quota is reset whenever the
// pause crosses into a new calendar year.
const MAX_PAUSE_MONTHS_PER_YEAR = 3;

// Returns the calendar year of `d` in Europe/Paris (the userbase locale).
// Using UTC here would miscredit early-January pauses to the prior year.
function parisYear(d: Date): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
  });
  return Number(fmt.format(d));
}

billingRoutes.post("/pause", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const months = Number(body?.months);
  if (![1, 2, 3].includes(months)) {
    return c.json(
      {
        error: "La durée doit être de 1, 2 ou 3 mois.",
        code: "INVALID_PAUSE_DURATION",
      },
      400,
    );
  }

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeSubscriptionId) {
    return c.json(
      { error: "Aucun abonnement trouvé", code: "SUBSCRIPTION_NOT_FOUND" },
      404,
    );
  }

  // Guard the conflicting-state edge: pausing a subscription that is
  // already scheduled for cancellation (or already paused) leaves the
  // user in a confusing "paused-and-cancelling" limbo. Force them to
  // /resume first. Issue #103 "Pause + cancel interaction unguarded".
  //
  // Pausing while still in trial is also rejected: it would burn 1-3
  // months of the annual quota for nothing (billing hasn't started, so
  // there is nothing to pause), and the user would still be billed at
  // trial-end. Surface a distinct `code` so the dialog can show specific
  // copy ("La pause est disponible une fois l'essai terminé.") rather
  // than the generic 409 message.
  const liveSub = await getStripe().subscriptions.retrieve(
    sub.stripeSubscriptionId,
  );
  if (liveSub.status === "trialing") {
    return c.json(
      {
        error: "La pause est disponible une fois l'essai terminé.",
        code: "PAUSE_TRIALING",
      },
      409,
    );
  }
  if (liveSub.cancel_at_period_end) {
    return c.json(
      {
        error:
          "Annulation déjà programmée. Annulez d'abord la résiliation via /resume avant de mettre en pause.",
        code: "PAUSE_CANCEL_PENDING",
      },
      409,
    );
  }
  if (liveSub.pause_collection) {
    return c.json(
      { error: "Abonnement déjà en pause", code: "PAUSE_ALREADY_PAUSED" },
      409,
    );
  }

  const now = new Date();
  // Year boundary in Europe/Paris (the userbase locale) rather than UTC.
  // A pause taken at 2026-01-01 00:30 local time would otherwise count
  // against 2025's quota for 1 hour each year, refunding it abruptly at
  // 02:00. Issue #103 P2.
  const currentYear = parisYear(now);
  const sameYear = sub.pauseYearRef === currentYear;
  const usedThisYear = sameYear ? sub.pauseMonthsUsed : 0;
  const remaining = MAX_PAUSE_MONTHS_PER_YEAR - usedThisYear;

  if (months > remaining) {
    return c.json(
      {
        error: "Quota de pause annuel dépassé",
        code: "PAUSE_QUOTA_EXCEEDED",
        remaining,
      },
      409,
    );
  }

  const resumesAt = new Date(now);
  resumesAt.setUTCMonth(resumesAt.getUTCMonth() + months);

  await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
    pause_collection: {
      behavior: "mark_uncollectible",
      resumes_at: Math.floor(resumesAt.getTime() / 1000),
    },
  });

  await db
    .update(subscription)
    .set({
      pausedUntil: resumesAt,
      pauseMonthsUsed: usedThisYear + months,
      pauseYearRef: currentYear,
      updatedAt: now,
    })
    .where(eq(subscription.id, sub.id));

  return c.json({
    pausedUntil: resumesAt.toISOString(),
    monthsUsed: usedThisYear + months,
    remaining: remaining - months,
  });
});

// Webhook — no auth, raw body for signature verification
export const stripeWebhookRoute = new Hono();

stripeWebhookRoute.post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  if (!sig) {
    return c.json(
      { error: "Missing signature", code: "WEBHOOK_MISSING_SIGNATURE" },
      400,
    );
  }

  const rawBody = await c.req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      getWebhookSecret()
    );
  } catch {
    return c.json(
      { error: "Invalid signature", code: "WEBHOOK_INVALID_SIGNATURE" },
      400,
    );
  }

  // Defensive: reject any event referencing a demo_-prefixed identifier.
  // The demo seed (apps/api/src/seed.ts) writes literal stripeSubscriptionId
  // = "demo_subscription"; if a forged or misconfigured webhook ever sent
  // an event with that id, processing it would mutate the demo account's
  // billing row. Issue #103 "Demo seed uses literal demo_subscription".
  if (containsDemoIdentifier(event)) {
    log.warn("stripe_webhook_rejected_demo_identifier", {
      eventId: event.id,
      eventType: event.type,
    });
    return c.json({ received: true, ignored: "demo_identifier" });
  }

  // Idempotency / dedup with crash-safe attempt counting. Stripe retries
  // any non-2xx response for ≥3 days and routinely re-delivers events
  // even on success during outages, so out-of-order replays of
  // `customer.subscription.updated` could overwrite newer state with
  // stale data.
  //
  // Two-phase contract (mirrored on the schema in
  // packages/db/src/schema/stripe-webhook-events.ts):
  //   1. INSERT (id, event_type, attempts=1) ON CONFLICT (id)
  //      DO UPDATE SET attempts = attempts + 1 RETURNING ...
  //      This unconditionally records that we saw the event, even if
  //      the handler later crashes — the previous "delete on failure"
  //      pattern lost the marker if the node was killed between INSERT
  //      and the catch-block DELETE, leaving the event eligible for
  //      processing again with no retry limit.
  //   2. UPDATE processed_at = NOW() once side effects committed.
  //
  // After MAX_WEBHOOK_ATTEMPTS failures we quarantine: ack 200 with a
  // warn log so a poison event doesn't pin Stripe in a 3-day retry
  // storm and burn the on-call rotation.
  const [ledger] = await db
    .insert(stripeWebhookEvent)
    .values({ id: event.id, eventType: event.type, attempts: 1 })
    .onConflictDoUpdate({
      target: stripeWebhookEvent.id,
      set: { attempts: sql`${stripeWebhookEvent.attempts} + 1` },
    })
    .returning({
      attempts: stripeWebhookEvent.attempts,
      processedAt: stripeWebhookEvent.processedAt,
    });

  if (ledger?.processedAt) {
    // Tagged log line so SREs can compute
    // stripe_webhook_total{event_type, status="duplicate"} from logs.
    log.info("stripe_webhook_event", {
      eventId: event.id,
      eventType: event.type,
      status: "duplicate",
    });
    return c.json({ received: true, duplicate: true });
  }

  if ((ledger?.attempts ?? 1) > MAX_WEBHOOK_ATTEMPTS) {
    log.warn("stripe_webhook_event", {
      eventId: event.id,
      eventType: event.type,
      attempts: ledger?.attempts,
      status: "quarantined",
    });
    return c.json({ received: true, quarantined: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.client_reference_id) {
          break;
        }

        const userId = session.client_reference_id;
        const stripeSub = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        await upsertSubscriptionFromStripe(userId, stripeSub, {
          stripeCustomerId: session.customer as string,
        });
        await recordServerEvent(userId, "subscription_started", {
          planId: stripeSub.items.data[0]?.price.id ?? null,
          interval: intervalFromStripe(stripeSub),
          trial: stripeSub.status === "trialing",
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserIdFromCustomer(
          stripeSub.customer as string,
        );
        if (!userId) {
          // Unknown customer — most likely a test event from a foreign
          // account or an event for a user that was already deleted.
          // Acking is safe; nothing to update.
          break;
        }
        await upsertSubscriptionFromStripe(userId, stripeSub);
        if (event.type === "customer.subscription.deleted") {
          const details = (
            stripeSub as unknown as {
              cancellation_details?: { reason?: string | null } | null;
            }
          ).cancellation_details;
          await recordServerEvent(userId, "subscription_canceled", {
            planId: stripeSub.items.data[0]?.price.id ?? null,
            interval: intervalFromStripe(stripeSub),
            reason: details?.reason ?? "unknown",
          });
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Fired ~3 days before a trial converts. Send the J-3 reminder
        // email here (event-driven) and stamp `trialReminderSentAt` so
        // the daily cron (`runTrialEndingReminders`) treats this user as
        // already-notified and skips them — keeps both sources idempotent.
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserIdFromCustomer(
          stripeSub.customer as string,
        );
        if (!userId) break;

        const [row] = await db
          .select({
            email: user.email,
            name: user.name,
            subscriptionId: subscription.id,
            trialReminderSentAt: subscription.trialReminderSentAt,
          })
          .from(subscription)
          .innerJoin(user, eq(user.id, subscription.userId))
          .where(eq(subscription.userId, userId))
          .limit(1);

        if (!row || row.trialReminderSentAt) break;

        const tpl = trialEndingReminderTemplate(row.name);
        const send = await sendEmail({
          to: row.email,
          subject: tpl.subject,
          html: tpl.html,
        });
        if (send.sent || send.reason === "no-api-key") {
          // Stamp on successful send OR when email is stubbed in dev:
          // both are terminal, and re-stamping on retry would let Stripe
          // re-trigger forever.
          await db
            .update(subscription)
            .set({ trialReminderSentAt: new Date(), updatedAt: new Date() })
            .where(eq(subscription.id, row.subscriptionId));
        }
        log.info("stripe_trial_will_end", {
          subscriptionId: stripeSub.id,
          trialEnd: stripeSub.trial_end,
          emailSent: send.sent,
        });
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        // A renewal succeeded or failed — the corresponding subscription
        // event will follow, but we proactively refresh the row so the UI
        // reflects the new currentPeriodEnd / past_due status without
        // waiting for the second event. Issue #103 "Missing webhook events".
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = (invoice as unknown as { subscription?: string })
          .subscription;
        if (!stripeSubId) break;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;
        const userId = await resolveUserIdFromCustomer(customerId);
        if (!userId) break;
        const stripeSub = await getStripe().subscriptions.retrieve(stripeSubId);
        await upsertSubscriptionFromStripe(userId, stripeSub);
        break;
      }
    }
  } catch (err) {
    log.error("stripe_webhook_failed", {
      eventId: event.id,
      eventType: event.type,
      attempts: ledger?.attempts,
      status: "failed",
      err,
    });
    // Leave the ledger row with `processed_at IS NULL` and the bumped
    // `attempts`. Stripe will retry; on the next attempt the row's
    // `attempts` increments again until quarantine kicks in. Crucially
    // we do NOT delete the row — the previous pattern lost the marker
    // entirely if the node crashed between DELETE and the response,
    // disabling the retry-bound forever.
    return c.json(
      { error: "Webhook processing failed", code: "WEBHOOK_PROCESSING_FAILED" },
      500,
    );
  }

  // Mark the ledger row processed; future retries of the same event_id
  // short-circuit at the `processedAt != null` check above.
  await db
    .update(stripeWebhookEvent)
    .set({ processedAt: new Date() })
    .where(eq(stripeWebhookEvent.id, event.id));

  // Tagged success log so SREs can compute
  // stripe_webhook_total{event_type, status="success"} from logs.
  log.info("stripe_webhook_event", {
    eventId: event.id,
    eventType: event.type,
    status: "success",
  });
  return c.json({ received: true });
});

// Returns true when the Stripe event payload references any identifier
// prefixed with `demo_` (the seed's literal namespace). Cheap shallow scan
// over the keys we care about — id, customer, subscription.
function containsDemoIdentifier(event: Stripe.Event): boolean {
  if (event.id.startsWith("demo_")) return true;
  const obj = event.data.object as unknown as Record<string, unknown>;
  for (const k of ["id", "customer", "subscription"] as const) {
    const v = obj[k];
    if (typeof v === "string" && v.startsWith("demo_")) return true;
  }
  return false;
}

// Single funnel for every subscription-state webhook. Conflict target is
// `userId` (unique post-migration 0030) so a re-subscription after cancel
// updates the existing row rather than creating a second one.
async function upsertSubscriptionFromStripe(
  userId: string,
  stripeSub: Stripe.Subscription,
  opts: { stripeCustomerId?: string } = {},
): Promise<void> {
  const periodEnd = getPeriodEnd(stripeSub);
  const planId = stripeSub.items.data[0]?.price.id;
  if (!planId) {
    throw new Error("Stripe subscription missing price id");
  }
  const interval = intervalFromStripe(stripeSub);
  const stripeCustomerId =
    opts.stripeCustomerId ??
    (typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id);

  // Mirror Stripe's pause_collection into our paused-until column. When
  // Stripe clears it (after .resumed or expiry), we clear too.
  const pauseCollection = (
    stripeSub as unknown as {
      pause_collection?: { resumes_at?: number | null } | null;
    }
  ).pause_collection;
  const pausedUntil =
    pauseCollection?.resumes_at != null
      ? new Date(pauseCollection.resumes_at * 1000)
      : null;
  const cancelAtPeriodEnd = stripeSub.cancel_at_period_end ?? false;

  await db
    .insert(subscription)
    .values({
      id: crypto.randomUUID(),
      userId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status,
      planId,
      interval,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
      pausedUntil,
    })
    .onConflictDoUpdate({
      target: subscription.userId,
      set: {
        stripeCustomerId,
        stripeSubscriptionId: stripeSub.id,
        status: stripeSub.status,
        planId,
        interval,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd,
        pausedUntil,
        updatedAt: new Date(),
      },
    });
}
