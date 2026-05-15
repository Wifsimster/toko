import { eq } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";

export type PremiumAccess = {
  /** True when the user may use plan-gated ("Famille") features right now. */
  active: boolean;
  /** True when a real subscription is paused (read-only window, C3). */
  paused: boolean;
  pausedUntil: Date | null;
  /** Stripe-mirrored status, or "none" when there is no subscription row. */
  subscriptionStatus: string;
  /** True when an administrator granted complimentary access. */
  granted: boolean;
};

/**
 * Single source of truth for "does this user have premium access?".
 *
 * Access is granted either by an active/trialing Stripe subscription or by
 * an admin-set complimentary flag (`user.premiumGranted`). The grant
 * overrides Stripe entirely — it ignores a paused subscription and never
 * expires until an admin revokes it.
 */
export async function getPremiumAccess(userId: string): Promise<PremiumAccess> {
  const [row] = await db
    .select({
      granted: user.premiumGranted,
      status: subscription.status,
      pausedUntil: subscription.pausedUntil,
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);

  const granted = row?.granted ?? false;
  const status = row?.status ?? "none";
  const paused = row?.pausedUntil != null && row.pausedUntil > new Date();
  const subActive =
    (status === "active" || status === "trialing") && !paused;

  return {
    active: granted || subActive,
    paused: paused && !granted,
    pausedUntil: paused && !granted ? row!.pausedUntil : null,
    subscriptionStatus: status,
    granted,
  };
}
