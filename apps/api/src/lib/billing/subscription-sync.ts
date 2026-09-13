import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";

/**
 * Everything that turns a Stripe object into a row in our `subscription`
 * table. The webhook handlers and the customer-facing endpoints both go
 * through here, so the two can never disagree about what "paused" or
 * "period end" means.
 */

export function intervalFromStripe(
  stripeSub: Stripe.Subscription,
): "month" | "year" | null {
  const raw = stripeSub.items.data[0]?.price.recurring?.interval;
  return raw === "month" || raw === "year" ? raw : null;
}

export function getPeriodEnd(stripeSub: Stripe.Subscription): Date {
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


// Single funnel for every subscription-state webhook. Conflict target is
// `userId` (unique post-migration 0030) so a re-subscription after cancel
// updates the existing row rather than creating a second one.
export async function upsertSubscriptionFromStripe(
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
