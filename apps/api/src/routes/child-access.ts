import { Hono } from "hono";
import { and, eq, isNull } from "drizzle-orm";
import {
  db,
  childAccess,
  childInvitations,
  user as userTable,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  assertChildAccess,
  assertChildOwner,
} from "../lib/child-access";
import { logAudit } from "../lib/audit";
import type { AppEnv } from "../types";

export const childAccessRoutes = new Hono<AppEnv>();

childAccessRoutes.use("*", authMiddleware);

// List members on a child. Both owner and co-parent can read the list —
// a co-parent should know who else is in the household.
childAccessRoutes.get("/child/:childId", async (c) => {
  const currentUser = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(currentUser.id, childId);

  const rows = await db
    .select({
      id: childAccess.id,
      userId: childAccess.userId,
      role: childAccess.role,
      grantedAt: childAccess.grantedAt,
      userName: userTable.name,
      userEmail: userTable.email,
    })
    .from(childAccess)
    .innerJoin(userTable, eq(userTable.id, childAccess.userId))
    .where(eq(childAccess.childId, childId));

  return c.json(rows);
});

// Owner-only: revoke a co-parent's access. Cannot revoke the owner row
// (would leave the child unowned). Use child + user pair as the key —
// the access row id is an internal detail.
childAccessRoutes.delete("/child/:childId/user/:userId", async (c) => {
  const currentUser = c.get("user");
  const childId = c.req.param("childId");
  const targetUserId = c.req.param("userId");

  await assertChildOwner(currentUser.id, childId);

  if (targetUserId === currentUser.id) {
    throw new AppError(
      "FORBIDDEN",
      "Le propriétaire ne peut pas se retirer de son propre enfant.",
      403,
    );
  }

  const [target] = await db
    .select({ email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, targetUserId))
    .limit(1);

  // Delete the access row AND any not-yet-accepted invitations for the same
  // (child, email) pair. Without this, revoke is bypassable: a previously
  // emailed link still resolves, the invitee re-accepts, and the revoke is
  // effectively undone. Done in one tx so we never leave a stale invite.
  const deleted = await db.transaction(async (tx) => {
    const removed = await tx
      .delete(childAccess)
      .where(
        and(
          eq(childAccess.childId, childId),
          eq(childAccess.userId, targetUserId),
          eq(childAccess.role, "co_parent"),
        ),
      )
      .returning({ id: childAccess.id });

    if (target?.email && removed.length > 0) {
      await tx
        .delete(childInvitations)
        .where(
          and(
            eq(childInvitations.childId, childId),
            eq(childInvitations.invitedEmail, target.email.toLowerCase()),
            isNull(childInvitations.acceptedAt),
          ),
        );
    }

    return removed;
  });

  if (deleted.length === 0) {
    throw new AppError("NOT_FOUND", "Co-parent non trouvé", 404);
  }

  void logAudit({
    actorId: currentUser.id,
    actorName: currentUser.name ?? null,
    childId,
    entityType: "child_access",
    entityId: deleted[0]?.id ?? null,
    action: "revoke",
    summary: "Accès retiré pour le co-parent",
  });

  return c.json({ ok: true });
});
