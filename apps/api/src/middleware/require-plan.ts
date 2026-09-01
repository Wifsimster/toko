import type { Context, Next } from "hono";
import { getPremiumAccess, type PremiumAccess } from "../lib/premium";
import { getChildOwnerId } from "../lib/child-access";

// Shared 403 bodies so every plan gate — global or child-scoped — answers
// with the same codes the frontend branches on.
function planDenial(c: Context, access: PremiumAccess) {
  // A paused subscription gets a distinct PLAN_PAUSED code so the frontend
  // can route to a "Reprendre l'abonnement" CTA instead of an upsell. An
  // admin-granted comp ignores the pause entirely (handled in getPremiumAccess).
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

/**
 * Plan gate for a request that targets one specific child.
 *
 * Paid features on a child are gated on the child OWNER's subscription, never
 * on the caller's: a co-parent invited onto a Famille household must see the
 * same 90-day trends and correlations the owner sees, exactly as they already
 * get full history (journal/symptoms) and the medical report. Checking the
 * caller's own plan locked co-parents out of those screens.
 *
 * Returns a 403 Response to hand back, or `null` when access is granted.
 * Call it AFTER `assertChildAccess` so a stranger can't probe a child id.
 */
export async function requireChildPlan(
  c: Context,
  childId: string,
): Promise<Response | null> {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  // Fall back to the caller when the child predates the child_access backfill
  // — matches getChildOwnerId's own fallback and keeps the gate closed rather
  // than open.
  const ownerId = (await getChildOwnerId(childId)) ?? user.id;
  return planDenial(c, await getPremiumAccess(ownerId));
}
