import type Stripe from "stripe";
import { eq, notInArray, or, sql } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";
import { log } from "../safe-logger";

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


// Statuses where the subscription still bills (or will) and grants access.
// `canceled` / `incomplete_expired` are terminal; `incomplete` is a failed
// first payment that Stripe expires on its own, so it does not block a new
// checkout either.
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

// Single funnel for every subscription-state webhook. Conflict target is
// `userId` (unique post-migration 0030) so a re-subscription after cancel
// updates the existing row rather than creating a second one.
//
// Because the row is keyed on the user, not the Stripe subscription, an
// event for an OLD subscription (sub A canceled, user now on sub B, Stripe
// retries an A event) must not overwrite the row. The conflict update is
// therefore conditional, evaluated atomically against the current row:
//   - same subscription id → always apply (callers pass the live object
//     retrieved from Stripe, so it is current truth, not a stale payload);
//   - different id → apply only if the incoming sub is live or the row's
//     sub is no longer live. A live subscription is never replaced by a
//     dead one.
// When the subscription id changes, per-subscription state
// (`trialReminderSentAt`) is reset so a new trial gets its reminder.
//
// Returns false when the update was skipped.
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
