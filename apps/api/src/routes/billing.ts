import { Hono } from "hono";
import Stripe from "stripe";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, subscription } from "@focusflow/db";
import { eq } from "drizzle-orm";

let _stripe: Stripe | undefined;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

function getPriceId() {
  return process.env.STRIPE_PRICE_ID!;
}

function getPeriodEnd(sub: Record<string, unknown>): Date {
  const ts =
    (sub as { current_period_end?: number }).current_period_end ??
    (sub as { billing_cycle_anchor?: number }).billing_cycle_anchor;
  return ts ? new Date(ts * 1000) : new Date(Date.now() + 30 * 86400000);
}

export const billingRoutes = new Hono<AppEnv>();

// Checkout session creation — requires auth
billingRoutes.post("/checkout", authMiddleware, async (c) => {
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

  const session = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    client_reference_id: currentUser.id,
    line_items: [{ price: getPriceId(), quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/dashboard?billing=success`,
    cancel_url: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/#tarifs`,
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return c.json({ error: "Invalid signature" }, 400);
  }

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

      await db
        .insert(subscription)
        .values({
          id: crypto.randomUUID(),
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSub.id,
          status: stripeSub.status,
          planId:
            stripeSub.items.data[0]?.price.id ?? getPriceId(),
          currentPeriodEnd: periodEnd,
        })
        .onConflictDoUpdate({
          target: subscription.stripeSubscriptionId,
          set: {
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

  return c.json({ received: true });
});
