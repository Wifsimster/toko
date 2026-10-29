import type { Context, Next } from "hono";
import { getPremiumAccess, type PremiumAccess } from "../lib/premium";
import { getChildOwnerId } from "../lib/child-access";

function planDenial(c: Context, access: PremiumAccess) {
  if (access.paused) {
    return c.json(
      {
        error:
          "Abonnement en pause — reprenez-le pour utiliser cette fonctionnalité.",
        code: "PLAN_PAUSED",
      },
      403,
    );
  }

  if (!access.active) {
    return c.json(
      {
        error: "Fonctionnalité réservée au plan Famille",
        code: "PLAN_REQUIRED",
        upgrade: true,
      },
      403,
    );
  }

  return null;
}

export async function requirePlan(c: Context, next: Next) {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const denial = planDenial(c, await getPremiumAccess(user.id));
  if (denial) return denial;

  await next();
}

export async function requireChildPlan(
  c: Context,
  childId: string,
): Promise<Response | null> {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const ownerId = (await getChildOwnerId(childId)) ?? user.id;
  return planDenial(c, await getPremiumAccess(ownerId));
}
