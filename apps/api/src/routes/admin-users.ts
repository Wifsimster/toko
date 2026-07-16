import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { auth } from "../lib/auth";
import {
  updateUserRoleSchema,
  updateUserPremiumSchema,
  updateUserBetaSchema,
  blockUserSchema,
} from "@focusflow/validators";
import { db, user, subscription, session, account } from "@focusflow/db";

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
  betaCohort: user.betaCohort,
  isBlocked: user.isBlocked,
  blockedReason: user.blockedReason,
  deletionScheduledAt: user.deletionScheduledAt,
  createdAt: user.createdAt,
} as const;

// GET /api/admin/users — full account list for the admin console, with
// each user's Stripe subscription state and Better Auth sign-in methods
// joined in (read-only).
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

  // Sign-in methods live in the Better Auth `account` table — one row per
  // linked provider ("credential" for e-mail/password, "google" for
  // Google). Fetched separately and grouped here so the per-user provider
  // list doesn't multiply the subscription-joined rows above.
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

// PATCH /api/admin/users/:id/beta — add or remove an account from the
// closed-beta cohort (Phase 3). Scopes beta measurement + in-app feedback.
adminUsersRoutes.patch("/:id/beta", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const targetId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateUserBetaSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Payload invalide", issues: parsed.error.issues },
      422,
    );
  }

  const [updated] = await db
    .update(user)
    .set({ betaCohort: parsed.data.betaCohort, updatedAt: new Date() })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return c.json(updated);
});

// PATCH /api/admin/users/:id/block — block or unblock an account. A
// blocked user is signed out at once and can't sign back in.
adminUsersRoutes.patch("/:id/block", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const targetId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = blockUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Payload invalide", issues: parsed.error.issues },
      422,
    );
  }

  // An admin can't block their own account — that would lock them out
  // of the console with no way back in.
  if (targetId === me.id && parsed.data.isBlocked) {
    throw new AppError(
      "CANNOT_BLOCK_SELF",
      "Vous ne pouvez pas bloquer votre propre compte.",
      422,
    );
  }

  const reason = parsed.data.reason?.trim();
  const [updated] = await db
    .update(user)
    .set({
      isBlocked: parsed.data.isBlocked,
      // Keep the note only while blocked; clear it on unblock.
      blockedReason: parsed.data.isBlocked ? (reason ? reason : null) : null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetId))
    .returning(accountColumns);

  if (!updated) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  // Revoke every active session so the user is signed out immediately,
  // not on next cookie-cache expiry.
  if (parsed.data.isBlocked) {
    await db.delete(session).where(eq(session.userId, targetId));
  }

  return c.json(updated);
});

// POST /api/admin/users/:id/reset-password — email the user a password
// reset link. Reuses the standard self-service flow: Better Auth issues
// a one-hour token and sends the SPA reset link. The admin never sees
// or sets the password.
adminUsersRoutes.post("/:id/reset-password", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

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

// POST /api/admin/users/:id/schedule-deletion — schedule the account for
// erasure after the 30-day grace period. Reversible via /cancel-deletion.
// Mirrors the self-service flow in account.ts: this only stamps the
// timestamp; the cron finalizer performs the actual deletion (and the
// Stripe cleanup that goes with it).
adminUsersRoutes.post("/:id/schedule-deletion", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const targetId = c.req.param("id");

  // An admin can't schedule their own deletion from the console — the
  // self-service account-deletion flow exists for that.
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

  // Administrator accounts can't be deleted from the console — removing
  // an admin must go through an explicit role change first, so the last
  // admin can never be deleted by mistake.
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

// POST /api/admin/users/:id/cancel-deletion — call off a scheduled
// deletion while the grace period is still running. A safe recovery
// action, so it carries no self/admin guard.
adminUsersRoutes.post("/:id/cancel-deletion", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

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
