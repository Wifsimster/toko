import { Hono } from "hono";
import Stripe from "stripe";
import { z } from "zod";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { db, subscription, user } from "@focusflow/db";
import { eq } from "drizzle-orm";
import {
  getStripe,
  resolvePriceId,
  lookupKeyFor,
  PRICE_LOOKUP_KEYS,
  type Plan,
} from "../lib/stripe";
import {
  decidePremiumAccess,
  getFormationAccess,
  getPremiumAccess,
} from "../lib/premium";
import { env } from "../lib/env";
import { parseBody } from "../lib/http/validate";
import {
  getPeriodEnd,
  isLiveSubscriptionStatus,
  upsertSubscriptionFromStripe,
} from "../lib/billing/subscription-sync";
import { addMonthsClamped } from "../lib/billing/dates";


// Stripe Checkout supports a fixed set of locales; we whitelist the two we
// actually ship in the app so a stray header can't push an unsupported
// value into the request and trigger a Stripe 400.
const CHECKOUT_LOCALES = ["fr", "en"] as const;
const checkoutBodySchema = z.object({
  plan: z.enum(["monthly", "annual"]).optional(),
  locale: z.enum(CHECKOUT_LOCALES).optional(),
});

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


export const billingRoutes = new Hono<AppEnv>();

// Checkout session creation — requires auth
billingRoutes.post("/checkout", authMiddleware, checkoutLimiter, async (c) => {
  const currentUser = c.get("user");

  // Annual is the default — better LTV for us, ~35% off for the parent.
  // Monthly stays available via { plan: "monthly" } for those who want the
  // shorter commitment.
  const input = await parseBody(c, checkoutBodySchema);
  const plan: Plan = input.plan ?? "annual";
  const locale = input.locale ?? "fr";

  // One live subscription per user. The row is keyed on userId, so a second
  // checkout would re-point it at the new subscription and orphan the old
  // one — which keeps billing in Stripe. Our row can lag Stripe (missed
  // webhook), so a "live" local status is confirmed against Stripe before
  // refusing; if Stripe says it is actually over, resync and continue.
  const [existingSub] = await db
    .select({
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
    })
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (existingSub && isLiveSubscriptionStatus(existingSub.status)) {
    let stillLive = true;
    try {
      const liveSub = await getStripe().subscriptions.retrieve(
        existingSub.stripeSubscriptionId,
      );
      stillLive = isLiveSubscriptionStatus(liveSub.status);
      if (!stillLive) {
        await upsertSubscriptionFromStripe(currentUser.id, liveSub);
      }
    } catch {
      // Can't confirm (Stripe down, demo/seeded id): stay on the safe side.
      stillLive = true;
    }
    if (stillLive) {
      return c.json(
        {
          error:
            "Vous avez déjà un abonnement en cours. Gérez-le depuis la page Abonnement.",
          code: "SUBSCRIPTION_ALREADY_ACTIVE",
        },
        409,
      );
    }
  }

  // The 14-day free trial is for first-time subscribers only: any previous
  // subscription row (even canceled) means the trial was already used, so
  // cancel + re-subscribe can't chain free trials.
  const grantTrial = !existingSub;

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

  // Formation→Famille upsell: a one-shot buyer who is not yet a subscriber
  // gets 50% off their first Famille year (the retention lever from the
  // §4.2 pricing decision). Applied only to the annual plan (so "first year"
  // maps to a single invoice), only when the coupon is configured, and the
  // eligibility is re-checked server-side — the client never asserts it.
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  if (plan === "annual" && env.FORMATION_UPSELL_COUPON_ID) {
    const [buyer] = await db
      .select({ purchasedAt: user.formationPurchasedAt })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);
    if (buyer?.purchasedAt) {
      const premium = await getPremiumAccess(currentUser.id);
      if (!premium.active) {
        discounts.push({ coupon: env.FORMATION_UPSELL_COUPON_ID });
      }
    }
  }

  const session = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    client_reference_id: currentUser.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    // Checkout rejects `discounts` alongside `allow_promotion_codes`; we set
    // neither elsewhere, so applying the upsell coupon here is safe.
    ...(discounts.length ? { discounts } : {}),
    ...(grantTrial ? { subscription_data: { trial_period_days: 14 } } : {}),
    // Business rule C1: start the 14-day trial without collecting a card.
    // Stripe will prompt for payment before the trial ends via reminder emails.
    // Without a trial the first invoice is due now, so Stripe collects a card.
    payment_method_collection: "if_required",
    success_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/dashboard?billing=success`,
    cancel_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/#tarifs`,
    locale,
  });

  return c.json({ url: session.url });
});

// Find-or-create the user's Stripe Customer. Mirrors the inline logic in
// POST /checkout (kept idempotent via a userId-keyed idempotency key so a
// retried call reuses the same Customer rather than leaking one — issue #103).
async function ensureStripeCustomer(currentUser: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const [userRow] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (userRow?.stripeCustomerId) return userRow.stripeCustomerId;

  const customer = await getStripe().customers.create(
    {
      email: currentUser.email,
      name: currentUser.name,
      metadata: { userId: currentUser.id },
    },
    { idempotencyKey: `customer:${currentUser.id}` },
  );
  await db
    .update(user)
    .set({ stripeCustomerId: customer.id })
    .where(eq(user.id, currentUser.id));
  return customer.id;
}

const formationCheckoutBodySchema = z.object({
  locale: z.enum(CHECKOUT_LOCALES).optional(),
});

// Formation one-shot checkout (Barkley curriculum, mode:payment). A SEPARATE
// Stripe SKU from the Famille subscription: it grants only the teaching
// content (stamped by the webhook as formationPurchasedAt), never the Famille
// app privileges. Degrades to 503 when the one-time price isn't provisioned
// yet, and short-circuits to 409 when the user already owns the formation
// (grandfathered / already bought / active Famille) so nobody pays twice.
billingRoutes.post(
  "/checkout/formation",
  authMiddleware,
  checkoutLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const input = await parseBody(c, formationCheckoutBodySchema);
    const locale = input.locale ?? "fr";

    const { ownsFormation } = await getFormationAccess(currentUser.id);
    if (ownsFormation) {
      return c.json(
        { error: "Formation déjà débloquée", code: "FORMATION_ALREADY_OWNED" },
        409,
      );
    }

    let priceId: string;
    try {
      priceId = await resolvePriceId(PRICE_LOOKUP_KEYS.formationOneShot);
    } catch {
      // Price not provisioned yet — keep the buy button inert (503) rather
      // than surfacing a 500. The offer can ship dark until Stripe is set up.
      return c.json(
        {
          error: "La formation n'est pas encore disponible à l'achat.",
          code: "FORMATION_UNAVAILABLE",
        },
        503,
      );
    }

    const stripeCustomerId = await ensureStripeCustomer(currentUser);

    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: currentUser.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      // The Stripe account is shared with other apps; tag the payment so the
      // webhook only unlocks the formation for OUR product, never a stray
      // one-off charge. Duplicated onto the PaymentIntent for defense in depth.
      metadata: { userId: currentUser.id, product: "formation" },
      payment_intent_data: {
        metadata: { userId: currentUser.id, product: "formation" },
      },
      success_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/barkley?formation=success`,
      cancel_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/formation`,
      locale,
    });

    return c.json({ url: session.url });
  },
);

// Subscription status — requires auth
billingRoutes.get("/status", authMiddleware, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  // Admin-granted complimentary access is independent of Stripe — it
  // grants full access even with no subscription row, and overrides a
  // paused subscription.
  const [account] = await db
    .select({
      premiumGranted: user.premiumGranted,
      formationPurchasedAt: user.formationPurchasedAt,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  const granted = account?.premiumGranted ?? false;
  const boughtFormation = account?.formationPurchasedAt != null;

  // Formation is a distinct entitlement (one-shot / grandfathered / bundled
  // with Famille). Surfaced here so the frontend can render the Barkley
  // curriculum vs. the buy screen from a single status call.
  const { ownsFormation } = await getFormationAccess(currentUser.id);

  if (!sub) {
    return c.json({
      status: granted ? "granted" : "none",
      active: granted,
      granted,
      ownsFormation,
      // Eligible for the 50%-off-year-1 upsell: bought the one-shot but has
      // no active Famille access yet. (No sub row + not granted ⇒ inactive.)
      formationUpsellEligible: boughtFormation && !granted,
    });
  }

  // Surface the paused window so the frontend can render a distinct
  // "paused / Reprendre l'abonnement" state instead of conflating it with a
  // healthy active sub. Stripe leaves `status === "active"` while
  // pause_collection is set, so paused-ness is only legible via `pausedUntil`
  // — and for the same reason a paused parent used to be reported
  // `active: true` here, which unlocked every PremiumGate while the calls
  // behind them answered 403 PLAN_PAUSED. `decidePremiumAccess` is the very
  // decision `requirePlan` runs, so the two can no longer drift.
  const access = decidePremiumAccess({
    granted,
    status: sub.status,
    pausedUntil: sub.pausedUntil,
  });

  return c.json({
    status: sub.status,
    active: access.active,
    granted,
    // Bought the formation one-shot but the Famille sub isn't active
    // (canceled / past_due) — still eligible for the upsell to re-subscribe.
    // A paused sub is excluded: the answer there is "reprendre", not "acheter".
    formationUpsellEligible:
      boughtFormation && !access.active && !access.paused,
    paused: access.paused,
    pausedUntil: access.pausedUntil,
    // Surface the scheduled-cancellation window so the frontend can
    // render a distinct "Annulation programmée — Réactiver" branch.
    // Stripe leaves status="active" until the period actually lapses,
    // so this flag is the only legible signal that a cancel is pending.
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    planId: sub.planId,
    interval: sub.interval,
    currentPeriodEnd: sub.currentPeriodEnd,
    ownsFormation,
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

  const resumesAt = addMonthsClamped(now, months);

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
