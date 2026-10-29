import { and, eq } from "drizzle-orm";
import { db, childAccess, children } from "@focusflow/db";
import type { ChildAccessRole } from "@focusflow/validators";
import { AppError } from "../middleware/error-handler";

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

export async function childIsShared(childId: string): Promise<boolean> {
  const rows = await db
    .select({ userId: childAccess.userId })
    .from(childAccess)
    .where(eq(childAccess.childId, childId));
  return rows.length > 1;
}

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

export async function listAccessibleChildIds(
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ childId: childAccess.childId })
    .from(childAccess)
    .where(eq(childAccess.userId, userId));
  return rows.map((r) => r.childId);
}

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

  const [child] = await db
    .select({ parentId: children.parentId })
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);
  return child?.parentId ?? null;
}
