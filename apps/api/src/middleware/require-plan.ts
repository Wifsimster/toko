import type { Context, Next } from "hono";
import { db, subscription } from "@focusflow/db";
import { eq } from "drizzle-orm";

export async function requirePlan(c: Context, next: Next) {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const [sub] = await db
    .select({
      status: subscription.status,
      pausedUntil: subscription.pausedUntil,
    })
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  // A paused subscription stays `status === "active"` in Stripe
  // (pause_collection only suspends invoicing), so without checking
  // `pausedUntil` we would silently let paused users through to gated
  // endpoints — which contradicts the C3 contract that paused = read-only.
  // Surface a distinct PLAN_PAUSED code so the frontend can route them to
  // a "Reprendre l'abonnement" CTA instead of an "Upgrade" upsell.
  const paused = sub?.pausedUntil != null && sub.pausedUntil > new Date();
  if (paused) {
    return c.json(
      {
        error: "Abonnement en pause — reprenez-le pour utiliser cette fonctionnalité.",
        code: "PLAN_PAUSED",
      },
      403,
    );
  }

  const active = sub?.status === "active" || sub?.status === "trialing";
  if (!active) {
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
