import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, desc } from "drizzle-orm";
import { db, strengths } from "@focusflow/db";
import {
  createStrengthSchema,
  updateStrengthSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";

export const strengthsRoutes = new Hono<AppEnv>();

strengthsRoutes.use("*", authMiddleware);

strengthsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 100, 1), 500);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  const result = await db
    .select()
    .from(strengths)
    .where(eq(strengths.childId, childId))
    .orderBy(desc(strengths.occurredOn))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

strengthsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createStrengthSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const [entry] = await db.insert(strengths).values(parsed.data).returning();

  if (entry) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: entry.childId,
      entityType: "strength",
      entityId: entry.id,
      action: "create",
      summary: "Point fort ajouté",
    });
  }

  return c.json(entry, 201);
});

strengthsRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateStrengthSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(strengths)
    .where(eq(strengths.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Point fort non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(strengths)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(strengths.id, id))
    .returning();

  if (updated) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: updated.childId,
      entityType: "strength",
      entityId: updated.id,
      action: "update",
      summary: "Point fort modifié",
    });
  }

  return c.json(updated);
});

strengthsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(strengths)
    .where(eq(strengths.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Point fort non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(strengths).where(eq(strengths.id, id));

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "strength",
    entityId: existing.id,
    action: "delete",
    summary: "Point fort supprimé",
  });

  return c.json({ ok: true });
});
