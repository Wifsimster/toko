import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  updateUserRoleSchema,
  updateUserPremiumSchema,
} from "@focusflow/validators";
import { db, user, subscription } from "@focusflow/db";

export const adminUsersRoutes = new Hono<AppEnv>();

adminUsersRoutes.use("*", authMiddleware);

async function assertAdmin(userId: string) {
  const [row] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }
}

// Columns returned by the PATCH endpoints — the mutated account row.
const accountColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  isAdmin: user.isAdmin,
  premiumGranted: user.premiumGranted,
  deletionScheduledAt: user.deletionScheduledAt,
  createdAt: user.createdAt,
} as const;

// GET /api/admin/users — full account list for the admin console, with
// each user's Stripe subscription state joined in (read-only).
adminUsersRoutes.get("/", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const rows = await db
    .select({
      ...accountColumns,
      subscriptionStatus: subscription.status,
      subscriptionPausedUntil: subscription.pausedUntil,
      subscriptionCancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .orderBy(desc(user.createdAt));

  return c.json(rows);
});

// PATCH /api/admin/users/:id/role — grant or revoke the admin role.
adminUsersRoutes.patch("/:id/role", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const targetId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Payload invalide", issues: parsed.error.issues },
      422,
    );
  }

  // An admin can't strip their own role — without this guard the last
  // admin could lock everyone out of the console by mistake.
  if (targetId === me.id && !parsed.data.isAdmin) {
    throw new AppError(
      "CANNOT_DEMOTE_SELF",
      "Vous ne pouvez pas retirer votre propre rôle administrateur.",
      422,
    );
  }

  const [updated] = await db
    .update(user)
    .set({ isAdmin: parsed.data.isAdmin, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});

// PATCH /api/admin/users/:id/premium — grant or revoke complimentary
// premium access, independent of any Stripe subscription.
adminUsersRoutes.patch("/:id/premium", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const targetId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateUserPremiumSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Payload invalide", issues: parsed.error.issues },
      422,
    );
  }

  const [updated] = await db
    .update(user)
    .set({ premiumGranted: parsed.data.premiumGranted, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});
