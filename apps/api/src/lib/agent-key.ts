import crypto from "node:crypto";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db, agentKey, user as userTable } from "@focusflow/db";

const KEY_PREFIX = "toko_sk_";

export function hashAgentKey(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function generateAgentKey(): {
  secret: string;
  keyHash: string;
  prefix: string;
} {
  const secret = `${KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return {
    secret,
    keyHash: hashAgentKey(secret),
    prefix: secret.slice(0, 16),
  };
}

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
      userIsBlocked: userTable.isBlocked,
    })
    .from(agentKey)
    .innerJoin(userTable, eq(userTable.id, agentKey.userId))
    .where(eq(agentKey.keyHash, keyHash))
    .limit(1);

  if (!row || row.revokedAt || row.userIsBlocked) return null;
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

const AGENT_RATE_WINDOW_MS = 60_000;
const AGENT_RATE_MAX = 60;
const agentRateStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of agentRateStore) {
    if (e.resetAt <= now) agentRateStore.delete(k);
  }
}, 5 * 60 * 1000).unref();

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
