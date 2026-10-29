import type Stripe from "stripe";
import { eq, notInArray, or, sql } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";
import { log } from "../safe-logger";

export function intervalFromStripe(
  stripeSub: Stripe.Subscription,
): "month" | "year" | null {
  const raw = stripeSub.items.data[0]?.price.recurring?.interval;
  return raw === "month" || raw === "year" ? raw : null;
}

export function getPeriodEnd(stripeSub: Stripe.Subscription): Date {
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

export async function resolveUserIdFromCustomer(
  customerId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.stripeCustomerId, customerId))
    .limit(1);
  return row?.id ?? null;
}


export const LIVE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "paused",
] as const;

export function isLiveSubscriptionStatus(status: string): boolean {
  return (LIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
}

export async function upsertSubscriptionFromStripe(
  userId: string,
  stripeSub: Stripe.Subscription,
  opts: { stripeCustomerId?: string } = {},
): Promise<boolean> {
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

  const incomingLive = isLiveSubscriptionStatus(stripeSub.status);
  const written = await db
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
        trialReminderSentAt: sql`CASE WHEN ${subscription.stripeSubscriptionId} = ${stripeSub.id} THEN ${subscription.trialReminderSentAt} ELSE NULL END`,
        updatedAt: new Date(),
      },
      setWhere: incomingLive
        ? undefined
        : or(
            eq(subscription.stripeSubscriptionId, stripeSub.id),
            notInArray(subscription.status, [...LIVE_SUBSCRIPTION_STATUSES]),
          ),
    })
    .returning({ id: subscription.id });

  if (written.length === 0) {
    log.warn("stripe_subscription_event_ignored", {
      userId,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status,
      reason: "row_tracks_other_live_subscription",
    });
    return false;
  }
  return true;
}
