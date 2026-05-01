import { Hono } from "hono";
import Stripe from "stripe";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { db, subscription } from "@focusflow/db";
import { eq } from "drizzle-orm";
import {
  getStripe,
  getWebhookSecret,
  resolvePriceId,
  PRICE_LOOKUP_KEYS,
} from "../lib/stripe";
import { env } from "../lib/env";
import { log } from "../lib/safe-logger";

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

function getPeriodEnd(sub: Record<string, unknown>): Date {
  const ts =
    (sub as { current_period_end?: number }).current_period_end ??
    (sub as { billing_cycle_anchor?: number }).billing_cycle_anchor;
  return ts ? new Date(ts * 1000) : new Date(Date.now() + 30 * 86400000);
}

// Business rule C4: classify new subscriptions into a cohort at creation.
// The tag is never rewritten on updates, so early adopters keep their price
// forever. Returning null means no cohort metadata is stored.
function resolveCohort(now: Date = new Date()): "founding" | "regular" | null {
  const cutoff = env.FOUNDING_COHORT_UNTIL;
  if (!cutoff) return null;
  const cutoffDate = new Date(cutoff);
  if (Number.isNaN(cutoffDate.getTime())) return "regular";
  return now < cutoffDate ? "founding" : "regular";
}

export const billingRoutes = new Hono<AppEnv>();

// Checkout session creation — requires auth
billingRoutes.post("/checkout", authMiddleware, checkoutLimiter, async (c) => {
  const currentUser = c.get("user");

  // Find or create Stripe customer
  let stripeCustomerId: string;
  const [existing] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (existing?.stripeCustomerId) {
    stripeCustomerId = existing.stripeCustomerId;
  } else {
    const customer = await getStripe().customers.create({
      email: currentUser.email,
      name: currentUser.name,
      metadata: { userId: currentUser.id },
    });
    stripeCustomerId = customer.id;
  }

  const priceId = await resolvePriceId(PRICE_LOOKUP_KEYS.familleMonthly);

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
    locale: "fr",
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

  return c.json({
    status: sub.status,
    active: sub.status === "active" || sub.status === "trialing",
    planId: sub.planId,
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
    return c.json({ error: "Aucun abonnement trouvé" }, 404);
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/account`,
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
    return c.json({ error: "Aucun abonnement trouvé" }, 404);
  }

  const updated = await getStripe().subscriptions.update(
    sub.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );

  return c.json({
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    status: updated.status,
  });
});

billingRoutes.post("/resume", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeSubscriptionId) {
    return c.json({ error: "Aucun abonnement trouvé" }, 404);
  }

  const updated = await getStripe().subscriptions.update(
    sub.stripeSubscriptionId,
    { cancel_at_period_end: false }
  );

  return c.json({
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    status: updated.status,
  });
});

// Business rule C3: free pause up to 3 months per calendar year.
// Body: { months: 1 | 2 | 3 }. Remaining quota is reset whenever the
// pause crosses into a new calendar year.
const MAX_PAUSE_MONTHS_PER_YEAR = 3;

billingRoutes.post("/pause", authMiddleware, portalLimiter, async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const months = Number(body?.months);
  if (![1, 2, 3].includes(months)) {
    return c.json({ error: "months must be 1, 2 or 3" }, 400);
  }

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (!sub?.stripeSubscriptionId) {
    return c.json({ error: "Aucun abonnement trouvé" }, 404);
  }

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const sameYear = sub.pauseYearRef === currentYear;
  const usedThisYear = sameYear ? sub.pauseMonthsUsed : 0;
  const remaining = MAX_PAUSE_MONTHS_PER_YEAR - usedThisYear;

  if (months > remaining) {
    return c.json(
      { error: "Quota de pause annuel dépassé", remaining },
      409
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
    return c.json({ error: "Missing signature" }, 400);
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
    return c.json({ error: "Invalid signature" }, 400);
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
        const subData = stripeSub as unknown as Record<string, unknown>;
        const periodEnd = getPeriodEnd(subData);

        const planId = stripeSub.items.data[0]?.price.id;
        if (!planId) {
          throw new Error("Stripe subscription missing price id");
        }

        await db
          .insert(subscription)
          .values({
            id: crypto.randomUUID(),
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSub.id,
            status: stripeSub.status,
            planId,
            cohort: resolveCohort(),
            currentPeriodEnd: periodEnd,
          })
          .onConflictDoUpdate({
            target: subscription.stripeSubscriptionId,
            set: {
              // cohort intentionally absent — see rule C4 (immutable tag).
              status: stripeSub.status,
              currentPeriodEnd: periodEnd,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const subData = stripeSub as unknown as Record<string, unknown>;
        const periodEnd = getPeriodEnd(subData);

        await db
          .update(subscription)
          .set({
            status: stripeSub.status,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscription.stripeSubscriptionId, stripeSub.id));
        break;
      }
    }
  } catch (err) {
    log.error("stripe_webhook_failed", { eventType: event.type, err });
    return c.json({ error: "Webhook processing failed" }, 500);
  }

  return c.json({ received: true });
});
