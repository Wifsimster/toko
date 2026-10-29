import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, agentKey } from "@focusflow/db";
import { createAgentKeySchema } from "@focusflow/validators";
import type { AppEnv } from "../types";
import { authMiddleware, requireSession } from "../middleware/auth";
import { generateAgentKey } from "../lib/agent-key";
import { AppError } from "../middleware/error-handler";
import { withLiveSession } from "../lib/live-session";
import { parseBody } from "../lib/http/validate";

export const agentKeysRoutes = new Hono<AppEnv>();

agentKeysRoutes.use("*", authMiddleware);
agentKeysRoutes.use("*", requireSession);

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
  const input = await parseBody(c, createAgentKeySchema);

  const { secret, keyHash, prefix } = generateAgentKey();
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const created = await withLiveSession(c, async (tx) => {
    const existing = await tx
      .select({ id: agentKey.id })
      .from(agentKey)
      .where(and(eq(agentKey.userId, user.id), isNull(agentKey.revokedAt)));
    if (existing.length >= 10) {
      throw new AppError(
        "FORBIDDEN",
        "Limite de 10 clés d'accès atteinte. Supprimez-en une pour en créer une nouvelle.",
        403,
      );
    }
    const [row] = await tx
      .insert(agentKey)
      .values({
        id: randomUUID(),
        userId: user.id,
        name: input.name,
        keyHash,
        prefix,
        scopes: "read",
        expiresAt,
      })
      .returning(publicColumns);
    return row;
  });

  if (!created) throw new AppError("INTERNAL", "Échec de création", 500);

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
