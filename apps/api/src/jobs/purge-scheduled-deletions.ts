import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";
import { getStripe } from "../lib/stripe";
import { log } from "../lib/safe-logger";

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
        try {
          await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code !== 404) throw err;
        }
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
