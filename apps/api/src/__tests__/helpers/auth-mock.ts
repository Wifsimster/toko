import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { db, user as userTable, session as sessionTable } from "@focusflow/db";

export const TEST_USER_HEADER = "x-test-user-id";

export async function testAuthMiddleware(
  c: Context,
  next: Next,
): Promise<Response | void> {
  const userId = c.req.header(TEST_USER_HEADER);
  if (!userId) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const [row] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      emailVerified: userTable.emailVerified,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!row) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  const sessionId = `test-session-${row.id}`;
  const expiresAt = new Date(Date.now() + 60 * 60_000);
  await db
    .insert(sessionTable)
    .values({ id: sessionId, token: sessionId, userId: row.id, expiresAt })
    .onConflictDoNothing();

  c.set("user", row);
  c.set("session", { id: sessionId, expiresAt });
  c.set("authType", "session");
  await next();
}

export async function testRequireSession(
  _c: Context,
  next: Next,
): Promise<void> {
  await next();
}
