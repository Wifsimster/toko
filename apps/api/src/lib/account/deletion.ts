import { eq } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";
import { getStripe } from "../stripe";

/**
 * Erasure has to propagate to our processors, not just our database
 * (RGPD Art. 17). Keeping the Stripe half here means the route reads as
 * "erase billing, then delete the row" and this logic can be reasoned
 * about — and changed when Stripe's API moves — on its own.
 */
export async function eraseBillingFootprint(userId: string): Promise<void> {
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
  }

  // The Stripe customerId is persisted on `user` from /checkout time; fall
  // back to the subscription row for legacy users who subscribed before
  // that change.
  const [profile] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const stripeCustomerId =
    profile?.stripeCustomerId ?? sub?.stripeCustomerId ?? null;

  if (!stripeCustomerId) return;

  try {
    await getStripe().customers.del(stripeCustomerId);
  } catch (err) {
    // A 404 (customer already deleted, e.g. test data) must not block the
    // user's right to erasure on our side. Anything else we do want to
    // surface — re-throw so the request fails loud.
    const code = (err as { statusCode?: number; raw?: { code?: string } })
      .statusCode;
    if (code !== 404) throw err;
  }
}
