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

billingRoutes.post("/checkout", authMiddleware, checkoutLimiter, async (c) => {
  const currentUser = c.get("user");

  const input = await parseBody(c, checkoutBodySchema);
  const plan: Plan = input.plan ?? "annual";
  const locale = input.locale ?? "fr";

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

  const grantTrial = !existingSub;

  let stripeCustomerId: string;
  const [userRow] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (userRow?.stripeCustomerId) {
    stripeCustomerId = userRow.stripeCustomerId;
  } else {
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
    ...(discounts.length ? { discounts } : {}),
    ...(grantTrial ? { subscription_data: { trial_period_days: 14 } } : {}),
    payment_method_collection: "if_required",
    success_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/dashboard?billing=success`,
    cancel_url: `${env.CORS_ORIGIN || "http://localhost:5173"}/#tarifs`,
    locale,
  });

  return c.json({ url: session.url });
});

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

billingRoutes.get("/status", authMiddleware, async (c) => {
  const currentUser = c.get("user");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

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

  const { ownsFormation } = await getFormationAccess(currentUser.id);

  if (!sub) {
    return c.json({
      status: granted ? "granted" : "none",
      active: granted,
      granted,
      ownsFormation,
      formationUpsellEligible: boughtFormation && !granted,
    });
  }

  const access = decidePremiumAccess({
    granted,
    status: sub.status,
    pausedUntil: sub.pausedUntil,
  });

  return c.json({
    status: sub.status,
    active: access.active,
    granted,
    formationUpsellEligible:
      boughtFormation && !access.active && !access.paused,
    paused: access.paused,
    pausedUntil: access.pausedUntil,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    planId: sub.planId,
    interval: sub.interval,
    currentPeriodEnd: sub.currentPeriodEnd,
    ownsFormation,
  });
});

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
    ...(env.STRIPE_PORTAL_CONFIG_ID
      ? { configuration: env.STRIPE_PORTAL_CONFIG_ID }
      : {}),
  });

  return c.json({ url: session.url });
});

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

const MAX_PAUSE_MONTHS_PER_YEAR = 3;

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
