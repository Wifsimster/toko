import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { db, user as userTable } from "@focusflow/db";

// Drop-in replacement for the real authMiddleware in integration tests.
// Tests authenticate by passing the fixture user's id in the
// `x-test-user-id` header instead of a Better Auth session cookie — the
// route handlers see the same `c.get("user")` shape they would in prod.
//
// Anything outside the test runner can't reach this code path because the
// helper is only imported from __tests__.
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

  c.set("user", row);
  c.set("session", {
    id: "test-session",
    expiresAt: new Date(Date.now() + 60 * 60_000),
  });
  c.set("authType", "session");
  await next();
}

// Stand-in for `requireSession` — a no-op in tests, since fixtures always
// authenticate via the test header and never via an agent API key.
export async function testRequireSession(
  _c: Context,
  next: Next,
): Promise<void> {
  await next();
}
