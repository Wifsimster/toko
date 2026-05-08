import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";
import { getStripe } from "../lib/stripe";
import { log } from "../lib/safe-logger";

// Business rule F3: hard-delete users whose deletion was scheduled more
// than 30 days ago. FK cascades purge children, symptoms, journal,
// medications, barkley data, crisis items, preferences, sessions and
// accounts in a single transaction.
//
// Stripe-side erasure (RGPD Art. 17 — must propagate to processors): for
// each soon-to-be-purged user we cancel any live subscription and delete
// the Stripe Customer before the local row goes away. This mirrors the
// synchronous DELETE /api/account path. Issue #103.
export async function runPurgeScheduledDeletions(): Promise<{ purged: number }> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const due = await db
    .select({
      id: user.id,
      stripeCustomerId: user.stripeCustomerId,
    })
    .from(user)
    .where(
      and(
        isNotNull(user.deletionScheduledAt),
        lt(user.deletionScheduledAt, cutoff),
      ),
    );

  if (due.length === 0) return { purged: 0 };

  const stripe = getStripe();
  let purged = 0;

  for (const target of due) {
    try {
      const [sub] = await db
        .select({
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          status: subscription.status,
          stripeCustomerId: subscription.stripeCustomerId,
        })
        .from(subscription)
        .where(eq(subscription.userId, target.id))
        .limit(1);

      if (sub && (sub.status === "active" || sub.status === "trialing")) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      }

      const stripeCustomerId =
        target.stripeCustomerId ?? sub?.stripeCustomerId ?? null;
      if (stripeCustomerId) {
        try {
          await stripe.customers.del(stripeCustomerId);
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code !== 404) throw err;
        }
      }

      // Only purge the local row if Stripe-side erasure succeeded.
      // A failure leaves deletionScheduledAt set so the next cron tick
      // retries — we never want to forget the user locally while their
      // PII still lives in Stripe.
      await db.delete(user).where(eq(user.id, target.id));
      purged += 1;
    } catch (err) {
      log.error("purge_scheduled_deletion_stripe_failed", {
        userId: target.id,
        err,
      });
    }
  }

  return { purged };
}
