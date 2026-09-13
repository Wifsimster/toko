import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import { AppError } from "./error-handler";

/**
 * Admin gate, as middleware rather than a call at the top of every handler.
 *
 * The same six-line `assertAdmin` was copied into all three admin routers
 * and invoked eleven times. A guard that has to be remembered per handler
 * is a guard that will eventually be forgotten on one; mounted on the
 * router it cannot be.
 */
export async function requireAdmin(c: Context, next: Next) {
  const currentUser = c.get("user") as { id: string } | undefined;
  if (!currentUser) {
    throw new AppError("UNAUTHORIZED", "Non autorisé", 401);
  }

  const [row] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  if (!row?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }

  await next();
}
