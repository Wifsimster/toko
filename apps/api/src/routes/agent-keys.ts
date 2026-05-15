import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db, agentKey } from "@focusflow/db";
import { createAgentKeySchema } from "@focusflow/validators";
import type { AppEnv } from "../types";
import { authMiddleware, requireSession } from "../middleware/auth";
import { generateAgentKey } from "../lib/agent-key";
import { AppError } from "../middleware/error-handler";

// Management of agent access keys. These routes are session-only: an agent
// key can never mint or revoke other keys.
export const agentKeysRoutes = new Hono<AppEnv>();

agentKeysRoutes.use("*", authMiddleware);
agentKeysRoutes.use("*", requireSession);

// Public-safe projection — the hash is never selected.
const publicColumns = {
  id: agentKey.id,
  name: agentKey.name,
  prefix: agentKey.prefix,
  scopes: agentKey.scopes,
  lastUsedAt: agentKey.lastUsedAt,
  expiresAt: agentKey.expiresAt,
  revokedAt: agentKey.revokedAt,
  createdAt: agentKey.createdAt,
};

agentKeysRoutes.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select(publicColumns)
    .from(agentKey)
    .where(eq(agentKey.userId, user.id))
    .orderBy(desc(agentKey.createdAt));
  return c.json(rows);
});

agentKeysRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createAgentKeySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  // Cap on how many active keys one account can hold — keeps a leaked
  // account from being turned into a key farm.
  const existing = await db
    .select({ id: agentKey.id })
    .from(agentKey)
    .where(eq(agentKey.userId, user.id));
  if (existing.length >= 10) {
    throw new AppError(
      "FORBIDDEN",
      "Limite de 10 clés d'accès atteinte. Supprimez-en une pour en créer une nouvelle.",
      403,
    );
  }

  const { secret, keyHash, prefix } = generateAgentKey();
  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const [created] = await db
    .insert(agentKey)
    .values({
      id: randomUUID(),
      userId: user.id,
      name: parsed.data.name,
      keyHash,
      prefix,
      scopes: "read",
      expiresAt,
    })
    .returning(publicColumns);

  if (!created) throw new AppError("INTERNAL", "Échec de création", 500);

  // `secret` is returned exactly once and is never retrievable afterwards.
  return c.json({ ...created, secret }, 201);
});

agentKeysRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [revoked] = await db
    .update(agentKey)
    .set({ revokedAt: new Date() })
    .where(and(eq(agentKey.id, id), eq(agentKey.userId, user.id)))
    .returning({ id: agentKey.id });

  if (!revoked) {
    throw new AppError("NOT_FOUND", "Clé d'accès non trouvée", 404);
  }

  return c.json({ ok: true });
});
