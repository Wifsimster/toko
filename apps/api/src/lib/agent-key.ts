import crypto from "node:crypto";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db, agentKey, user as userTable } from "@focusflow/db";

// Agent access keys look like `toko_sk_<43 base64url chars>`. The prefix is
// both a human cue and a scannable token for secret-detection tooling.
const KEY_PREFIX = "toko_sk_";

export function hashAgentKey(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/**
 * Mint a fresh key. The returned `secret` is shown to the parent exactly
 * once and never persisted — only `keyHash` and the display `prefix` are.
 */
export function generateAgentKey(): {
  secret: string;
  keyHash: string;
  prefix: string;
} {
  const secret = `${KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return {
    secret,
    keyHash: hashAgentKey(secret),
    // First 16 chars — enough to recognise a key in a list, far too few
    // to reconstruct the 256-bit secret.
    prefix: secret.slice(0, 16),
  };
}

/** Pull an agent key out of the request, supporting both header styles. */
export function extractApiKey(c: Context): string | null {
  const headerKey = c.req.header("x-api-key");
  if (headerKey) return headerKey.trim();
  const authz = c.req.header("authorization");
  if (authz?.startsWith(`Bearer ${KEY_PREFIX}`)) {
    return authz.slice("Bearer ".length).trim();
  }
  return null;
}

export interface VerifiedAgentKey {
  keyId: string;
  user: { id: string; name: string; email: string; emailVerified: boolean };
}

/**
 * Resolve a raw key to its owner, or null if the key is unknown, revoked or
 * expired. Updates `lastUsedAt` as a fire-and-forget side effect.
 */
export async function verifyAgentKey(
  rawKey: string,
): Promise<VerifiedAgentKey | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  const keyHash = hashAgentKey(rawKey);
  const [row] = await db
    .select({
      id: agentKey.id,
      expiresAt: agentKey.expiresAt,
      revokedAt: agentKey.revokedAt,
      userId: userTable.id,
      userName: userTable.name,
      userEmail: userTable.email,
      userEmailVerified: userTable.emailVerified,
    })
    .from(agentKey)
    .innerJoin(userTable, eq(userTable.id, agentKey.userId))
    .where(eq(agentKey.keyHash, keyHash))
    .limit(1);

  if (!row || row.revokedAt) return null;
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return null;

  void db
    .update(agentKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(agentKey.id, row.id))
    .catch(() => {});

  return {
    keyId: row.id,
    user: {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
      emailVerified: row.userEmailVerified,
    },
  };
}

// Per-key rate limit — deliberately well below the 120 req/min global IP
// limit. A personal assistant polling tracking data has no need for more.
const AGENT_RATE_WINDOW_MS = 60_000;
const AGENT_RATE_MAX = 60;
const agentRateStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of agentRateStore) {
    if (e.resetAt <= now) agentRateStore.delete(k);
  }
}, 5 * 60 * 1000).unref();

/** Returns false once a key exceeds its per-minute quota. */
export function checkAgentRateLimit(keyId: string): boolean {
  const now = Date.now();
  let entry = agentRateStore.get(keyId);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + AGENT_RATE_WINDOW_MS };
    agentRateStore.set(keyId, entry);
  }
  entry.count++;
  return entry.count <= AGENT_RATE_MAX;
}
