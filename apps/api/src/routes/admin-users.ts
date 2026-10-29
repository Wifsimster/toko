import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { requireAdmin } from "../middleware/require-admin";
import { AppError } from "../middleware/error-handler";
import { auth } from "../lib/auth";
import {
  updateUserRoleSchema,
  updateUserPremiumSchema,
  updateUserBetaSchema,
  blockUserSchema,
} from "@focusflow/validators";
import { db, user, subscription, session, account } from "@focusflow/db";
import { parseBody } from "../lib/http/validate";

export const adminUsersRoutes = new Hono<AppEnv>();

adminUsersRoutes.use("*", authMiddleware);
adminUsersRoutes.use("*", requireAdmin);

const accountColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  isAdmin: user.isAdmin,
  premiumGranted: user.premiumGranted,
  betaCohort: user.betaCohort,
  isBlocked: user.isBlocked,
  blockedReason: user.blockedReason,
  deletionScheduledAt: user.deletionScheduledAt,
  createdAt: user.createdAt,
} as const;

adminUsersRoutes.get("/", async (c) => {
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

  const accountRows = await db
    .select({ userId: account.userId, providerId: account.providerId })
    .from(account);

  const providersByUser = new Map<string, string[]>();
  for (const a of accountRows) {
    const list = providersByUser.get(a.userId);
    if (list) {
      if (!list.includes(a.providerId)) list.push(a.providerId);
    } else {
      providersByUser.set(a.userId, [a.providerId]);
    }
  }

  return c.json(
    rows.map((r) => ({
      ...r,
      authProviders: providersByUser.get(r.id) ?? [],
    })),
  );
});

adminUsersRoutes.patch("/:id/role", async (c) => {
  const me = c.get("user");

  const targetId = c.req.param("id");
  const input = await parseBody(c, updateUserRoleSchema);

  if (targetId === me.id && !input.isAdmin) {
    throw new AppError(
      "CANNOT_DEMOTE_SELF",
      "Vous ne pouvez pas retirer votre propre rôle administrateur.",
      422,
    );
  }

  const [updated] = await db
    .update(user)
    .set({ isAdmin: input.isAdmin, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});

adminUsersRoutes.patch("/:id/premium", async (c) => {
  const targetId = c.req.param("id");
  const input = await parseBody(c, updateUserPremiumSchema);

  const [updated] = await db
    .update(user)
    .set({ premiumGranted: input.premiumGranted, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});

adminUsersRoutes.patch("/:id/beta", async (c) => {
  const targetId = c.req.param("id");
  const input = await parseBody(c, updateUserBetaSchema);

  const [updated] = await db
    .update(user)
    .set({ betaCohort: input.betaCohort, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});

adminUsersRoutes.patch("/:id/block", async (c) => {
  const me = c.get("user");

  const targetId = c.req.param("id");
  const input = await parseBody(c, blockUserSchema);

  if (targetId === me.id && input.isBlocked) {
    throw new AppError(
      "CANNOT_BLOCK_SELF",
      "Vous ne pouvez pas bloquer votre propre compte.",
      422,
    );
  }

  const reason = input.reason?.trim();
  const [updated] = await db
    .update(user)
    .set({
      isBlocked: input.isBlocked,
      blockedReason: input.isBlocked ? (reason ? reason : null) : null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (input.isBlocked) {
    await db.delete(session).where(eq(session.userId, targetId));
  }

  return c.json(updated);
});

adminUsersRoutes.post("/:id/reset-password", async (c) => {
  const targetId = c.req.param("id");
  const [target] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, targetId))
    .limit(1);

  if (!target) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  await auth.api.requestPasswordReset({ body: { email: target.email } });

  return c.json({ email: target.email, name: target.name });
});

adminUsersRoutes.post("/:id/schedule-deletion", async (c) => {
  const me = c.get("user");

  const targetId = c.req.param("id");

  if (targetId === me.id) {
    throw new AppError(
      "CANNOT_DELETE_SELF",
      "Vous ne pouvez pas programmer la suppression de votre propre compte.",
      422,
    );
  }

  const [target] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, targetId))
    .limit(1);

  if (!target) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (target.isAdmin) {
    throw new AppError(
      "CANNOT_DELETE_ADMIN",
      "Les comptes administrateurs ne peuvent pas être supprimés. Retirez d'abord le rôle administrateur.",
      422,
    );
  }

  const [updated] = await db
    .update(user)
    .set({ deletionScheduledAt: new Date(), updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  return c.json(updated);
});

adminUsersRoutes.post("/:id/cancel-deletion", async (c) => {
  const targetId = c.req.param("id");

  const [updated] = await db
    .update(user)
    .set({ deletionScheduledAt: null, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});
