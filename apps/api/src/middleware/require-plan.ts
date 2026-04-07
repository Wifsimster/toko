import type { Context, Next } from "hono";
import { db, subscription } from "@focusflow/db";
import { eq } from "drizzle-orm";

export async function requirePlan(c: Context, next: Next) {
  const user = c.get("user") as { id: string } | undefined;
  if (!user) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const [sub] = await db
    .select({ status: subscription.status })
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  const active =
    sub?.status === "active" || sub?.status === "trialing";

  if (!active) {
    return c.json(
      { error: "Fonctionnalité réservée au plan Famille", code: "PLAN_REQUIRED", upgrade: true },
      403
    );
  }

  await next();
}
