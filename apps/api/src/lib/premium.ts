import { eq } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";

export type FormationReason =
  | "grandfathered"
  | "purchase"
  | "famille"
  | "granted"
  | "none";

export type FormationAccess = {
  /** True when the user may read the Barkley teaching curriculum. */
  ownsFormation: boolean;
  /** Why access was (or wasn't) granted — for analytics + UI copy. */
  reason: FormationReason;
};

/**
 * History window (in days) granted to the free plan. Premium ("Famille") gets
 * the full history — this is the pricing-grid promise "Historique complet de
 * suivi". Enforced server-side on the journal and symptom list endpoints so it
 * can't be bypassed by the client.
 */
export const FREE_HISTORY_DAYS = 30;

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

/**
 * Pure entitlement decision for "Tokō Formation" — extracted so the precedence
 * (grandfathered > purchase > Famille/granted > none) is unit-testable without
 * a database. See getFormationAccess for the data-loading wrapper.
 */
export function decideFormationAccess(input: {
  grandfathered: boolean;
  purchasedAt: Date | null;
  premiumActive: boolean;
  premiumGranted: boolean;
}): FormationAccess {
  if (input.grandfathered) return { ownsFormation: true, reason: "grandfathered" };
  if (input.purchasedAt) return { ownsFormation: true, reason: "purchase" };
  if (input.premiumActive) {
    return {
      ownsFormation: true,
      reason: input.premiumGranted ? "granted" : "famille",
    };
  }
  return { ownsFormation: false, reason: "none" };
}

/**
 * Entitlement source for "Tokō Formation" — the Barkley 10-step teaching
 * curriculum sold as a one-shot (89 €, `mode:payment`) alongside the Famille
 * subscription. This is orthogonal to `getPremiumAccess`: a Formation purchase
 * grants ONLY the curriculum, never the Famille app privileges (extra children,
 * full history, medical report). Access is granted when ANY of:
 *   - the account was grandfathered at launch (had the content before it was paid);
 *   - the user bought the formation one-shot (permanent — never revoked);
 *   - the user has active Famille access (sub/trial or admin grant) — Famille is
 *     the superset, so a subscriber never hits a second paywall on the method.
 */
export async function getFormationAccess(
  userId: string,
): Promise<FormationAccess> {
  const [row] = await db
    .select({
      grandfathered: user.formationGrandfathered,
      purchasedAt: user.formationPurchasedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const grandfathered = row?.grandfathered ?? false;
  const purchasedAt = row?.purchasedAt ?? null;

  // Skip the subscription round-trip when a cheaper signal already grants
  // access — grandfathered and one-shot buyers never need the premium check.
  if (grandfathered || purchasedAt) {
    return decideFormationAccess({
      grandfathered,
      purchasedAt,
      premiumActive: false,
      premiumGranted: false,
    });
  }

  const premium = await getPremiumAccess(userId);
  return decideFormationAccess({
    grandfathered,
    purchasedAt,
    premiumActive: premium.active,
    premiumGranted: premium.granted,
  });
}
