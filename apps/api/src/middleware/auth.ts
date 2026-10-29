import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { db, user as userTable } from "@focusflow/db";
import { auth } from "../lib/auth";
import {
  extractApiKey,
  verifyAgentKey,
  checkAgentRateLimit,
} from "../lib/agent-key";
import { isAgentReadAllowed } from "../lib/agent-access";
import { rateLimiter } from "./rate-limiter";

const userLimiter = rateLimiter({ namespace: "api-user", windowMs: 60_000, limit: 120, keyBy: "user" });

export async function authMiddleware(c: Context, next: Next) {
  const rawKey = extractApiKey(c);
  if (rawKey) {
    const verified = await verifyAgentKey(rawKey);
    if (!verified) {
      return c.json(
        { error: "Clé d'accès invalide, expirée ou révoquée", code: "UNAUTHORIZED" },
        401,
      );
    }

    if (!isAgentReadAllowed(c.req.method, c.req.path)) {
      return c.json(
        {
          error:
            "Cette clé d'accès est en lecture seule et limitée aux données de suivi de l'enfant.",
          code: "AGENT_FORBIDDEN",
        },
        403,
      );
    }

    if (!checkAgentRateLimit(verified.keyId)) {
      return c.json(
        { error: "Trop de requêtes pour cette clé d'accès", code: "RATE_LIMITED" },
        429,
      );
    }

    c.set("user", verified.user);
    c.set("authType", "apiKey");
    c.set("agentKeyId", verified.keyId);
    await next();
    return;
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, 401);
  }

  if (await isUserBlocked(session.user.id)) {
    return c.json(
      {
        error: "Ce compte a été bloqué. Contactez un administrateur.",
        code: "ACCOUNT_BLOCKED",
      },
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);
  c.set("authType", "session");
  return userLimiter(c, next);
}

async function isUserBlocked(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isBlocked: userTable.isBlocked })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);
  return !row || row.isBlocked;
}

export async function requireSession(c: Context, next: Next) {
  if (c.get("authType") === "apiKey") {
    return c.json(
      {
        error: "Action réservée à une session connectée",
        code: "SESSION_REQUIRED",
      },
      403,
    );
  }
  await next();
}
