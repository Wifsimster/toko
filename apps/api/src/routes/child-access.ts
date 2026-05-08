import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import {
  db,
  childAccess,
  user as userTable,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  assertChildAccess,
  assertChildOwner,
} from "../lib/child-access";
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

  const deleted = await db
    .delete(childAccess)
    .where(
      and(
        eq(childAccess.childId, childId),
        eq(childAccess.userId, targetUserId),
        eq(childAccess.role, "co_parent"),
      ),
    )
    .returning({ id: childAccess.id });

  if (deleted.length === 0) {
    throw new AppError("NOT_FOUND", "Co-parent non trouvé", 404);
  }

  return c.json({ ok: true });
});
