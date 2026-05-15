import type { Context, Next } from "hono";
import { getPremiumAccess } from "../lib/premium";

export async function requirePlan(c: Context, next: Next) {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const access = await getPremiumAccess(user.id);

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

  await next();
}
