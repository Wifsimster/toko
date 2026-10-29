import { eq } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";
import { getStripe } from "../stripe";

export async function eraseBillingFootprint(userId: string): Promise<void> {
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
  }

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
    const code = (err as { statusCode?: number; raw?: { code?: string } })
      .statusCode;
    if (code !== 404) throw err;
  }
}
