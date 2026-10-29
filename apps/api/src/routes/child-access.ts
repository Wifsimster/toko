import { Hono } from "hono";
import { and, eq, inArray, isNull, ne, or, type SQL } from "drizzle-orm";
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

function pendingInvitesTiedTo(
  userId: string,
  email: string | null | undefined,
): SQL | undefined {
  const tied = [eq(childInvitations.invitedBy, userId)];
  if (email) tied.push(eq(childInvitations.invitedEmail, email.toLowerCase()));
  return and(isNull(childInvitations.acceptedAt), or(...tied));
}

childAccessRoutes.get("/family", async (c) => {
  const currentUser = c.get("user");

  const ownedRows = await db
    .select({ childId: childAccess.childId })
    .from(childAccess)
    .where(
      and(
        eq(childAccess.userId, currentUser.id),
        eq(childAccess.role, "owner"),
      ),
    );
  const ownedChildIds = ownedRows.map((r) => r.childId);

  if (ownedChildIds.length === 0) {
    return c.json({ coParents: [], totalOwnedChildren: 0 });
  }

  const coParentRows = await db
    .select({
      userId: childAccess.userId,
      childId: childAccess.childId,
      grantedAt: childAccess.grantedAt,
      userName: userTable.name,
      userEmail: userTable.email,
    })
    .from(childAccess)
    .innerJoin(userTable, eq(userTable.id, childAccess.userId))
    .where(
      and(
        inArray(childAccess.childId, ownedChildIds),
        eq(childAccess.role, "co_parent"),
        ne(childAccess.userId, currentUser.id),
      ),
    );

  const byUser = new Map<
    string,
    {
      userId: string;
      userName: string | null;
      userEmail: string;
      childIds: string[];
      grantedAt: Date;
    }
  >();
  for (const r of coParentRows) {
    const existing = byUser.get(r.userId);
    if (existing) {
      existing.childIds.push(r.childId);
      if (r.grantedAt < existing.grantedAt) existing.grantedAt = r.grantedAt;
    } else {
      byUser.set(r.userId, {
        userId: r.userId,
        userName: r.userName,
        userEmail: r.userEmail,
        childIds: [r.childId],
        grantedAt: r.grantedAt,
      });
    }
  }

  return c.json({
    coParents: Array.from(byUser.values()),
    totalOwnedChildren: ownedChildIds.length,
  });
});

childAccessRoutes.delete("/family/user/:userId", async (c) => {
  const currentUser = c.get("user");
  const targetUserId = c.req.param("userId");

  if (targetUserId === currentUser.id) {
    throw new AppError(
      "FORBIDDEN",
      "Vous ne pouvez pas vous retirer vous-même.",
      403,
    );
  }

  const ownedRows = await db
    .select({ childId: childAccess.childId })
    .from(childAccess)
    .where(
      and(
        eq(childAccess.userId, currentUser.id),
        eq(childAccess.role, "owner"),
      ),
    );
  const ownedChildIds = ownedRows.map((r) => r.childId);
  if (ownedChildIds.length === 0) {
    return c.json({ ok: true, removedChildIds: [] });
  }

  const [target] = await db
    .select({ email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, targetUserId))
    .limit(1);

  const removedIds = await db.transaction(async (tx) => {
    const removed = await tx
      .delete(childAccess)
      .where(
        and(
          inArray(childAccess.childId, ownedChildIds),
          eq(childAccess.userId, targetUserId),
          eq(childAccess.role, "co_parent"),
        ),
      )
      .returning({ id: childAccess.id, childId: childAccess.childId });

    if (removed.length > 0) {
      await tx
        .delete(childInvitations)
        .where(
          and(
            inArray(
              childInvitations.childId,
              removed.map((r) => r.childId),
            ),
            pendingInvitesTiedTo(targetUserId, target?.email),
          ),
        );
    }

    return removed;
  });

  for (const r of removedIds) {
    void logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name ?? null,
      childId: r.childId,
      entityType: "child_access",
      entityId: r.id,
      action: "revoke",
      summary: "Accès retiré pour le co-parent (action famille)",
    });
  }

  return c.json({
    ok: true,
    removedChildIds: removedIds.map((r) => r.childId),
  });
});

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

    if (removed.length > 0) {
      await tx
        .delete(childInvitations)
        .where(
          and(
            eq(childInvitations.childId, childId),
            pendingInvitesTiedTo(targetUserId, target?.email),
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
