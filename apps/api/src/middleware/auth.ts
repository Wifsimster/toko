import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import {
  extractApiKey,
  verifyAgentKey,
  checkAgentRateLimit,
} from "../lib/agent-key";
import { isAgentReadAllowed } from "../lib/agent-access";

export async function authMiddleware(c: Context, next: Next) {
  // Agent access key path — checked before the session so an AI assistant
  // can authenticate without a browser cookie.
  const rawKey = extractApiKey(c);
  if (rawKey) {
    const verified = await verifyAgentKey(rawKey);
    if (!verified) {
      return c.json(
        { error: "Clé d'accès invalide, expirée ou révoquée", code: "UNAUTHORIZED" },
        401,
      );
    }

    // Agent keys are read-only and confined to a fixed allowlist. This is
    // enforced here, not derived from the key, so the boundary holds even
    // if a key row were tampered with.
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

  c.set("user", session.user);
  c.set("session", session.session);
  c.set("authType", "session");
  await next();
}

/**
 * Guard for routes that must only ever be reached by a real browser session
 * — never an agent key (e.g. issuing or revoking keys themselves).
 */
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
