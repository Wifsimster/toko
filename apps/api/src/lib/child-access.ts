import { and, eq } from "drizzle-orm";
import { db, childAccess, children } from "@focusflow/db";
import type { ChildAccessRole } from "@focusflow/validators";
import { AppError } from "../middleware/error-handler";

// Truth source for "can this user touch this child?". Replaces the historical
// `children.parentId === user.id` check that every route used to do inline.
// Reads `child_access` so co-parents (role = "co_parent") pass too.

export async function userHasChildAccess(
  userId: string,
  childId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ role: childAccess.role })
    .from(childAccess)
    .where(
      and(eq(childAccess.userId, userId), eq(childAccess.childId, childId)),
    )
    .limit(1);
  return Boolean(row);
}

export async function userChildRole(
  userId: string,
  childId: string,
): Promise<ChildAccessRole | null> {
  const [row] = await db
    .select({ role: childAccess.role })
    .from(childAccess)
    .where(
      and(eq(childAccess.userId, userId), eq(childAccess.childId, childId)),
    )
    .limit(1);
  return row?.role ?? null;
}

export async function userIsChildOwner(
  userId: string,
  childId: string,
): Promise<boolean> {
  return (await userChildRole(userId, childId)) === "owner";
}

// Throws NOT_FOUND (not 403) on miss, deliberately — we don't leak whether
// the child exists to a user without access.
export async function assertChildAccess(
  userId: string,
  childId: string,
): Promise<void> {
  const ok = await userHasChildAccess(userId, childId);
  if (!ok) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }
}

export async function assertChildOwner(
  userId: string,
  childId: string,
): Promise<void> {
  const role = await userChildRole(userId, childId);
  if (role !== "owner") {
    throw new AppError(
      "FORBIDDEN",
      "Cette action est réservée au parent propriétaire de l'enfant",
      403,
    );
  }
}

// All child ids this user can read (owner or co-parent). Replaces the
// historical "WHERE children.parentId = user.id" subquery used by list
// endpoints.
export async function listAccessibleChildIds(
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ childId: childAccess.childId })
    .from(childAccess)
    .where(eq(childAccess.userId, userId));
  return rows.map((r) => r.childId);
}

// The owner is the user whose subscription gates paid features for the child.
// Used by requirePlan when the request targets a specific child (path param or
// body field) — a co-parent does not need their own Famille plan.
export async function getChildOwnerId(
  childId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ userId: childAccess.userId })
    .from(childAccess)
    .where(
      and(eq(childAccess.childId, childId), eq(childAccess.role, "owner")),
    )
    .limit(1);
  if (row) return row.userId;

  // Fallback to children.parent_id in case a child predates the backfill.
  // Should not happen in normal operation but keeps a stale-data edge case
  // from breaking access checks.
  const [child] = await db
    .select({ parentId: children.parentId })
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);
  return child?.parentId ?? null;
}
