import type { Context, Next } from "hono";
import { auth } from "../lib/auth";

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}
