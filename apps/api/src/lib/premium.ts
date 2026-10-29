import { eq } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";

export type FormationReason =
  | "grandfathered"
  | "purchase"
  | "famille"
  | "granted"
  | "none";

export type FormationAccess = {
  ownsFormation: boolean;
  reason: FormationReason;
};

export const FREE_HISTORY_DAYS = 30;

export type PremiumAccess = {
  active: boolean;
  paused: boolean;
  pausedUntil: Date | null;
  subscriptionStatus: string;
  granted: boolean;
};

export function decidePremiumAccess(input: {
  granted: boolean;
  status: string | null;
  pausedUntil: Date | null;
  now?: Date;
}): PremiumAccess {
  const now = input.now ?? new Date();
  const status = input.status ?? "none";
  const paused = input.pausedUntil != null && input.pausedUntil > now;
  const subActive =
    (status === "active" || status === "trialing") && !paused;

  return {
    active: input.granted || subActive,
    paused: paused && !input.granted,
    pausedUntil: paused && !input.granted ? input.pausedUntil : null,
    subscriptionStatus: status,
    granted: input.granted,
  };
}

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

  return decidePremiumAccess({
    granted: row?.granted ?? false,
    status: row?.status ?? null,
    pausedUntil: row?.pausedUntil ?? null,
  });
}

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
