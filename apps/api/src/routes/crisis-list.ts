import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, asc, sql } from "drizzle-orm";
import { db, crisisItems } from "@focusflow/db";
import {
  createCrisisItemSchema,
  updateCrisisItemSchema,
  reorderCrisisItemsSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";
import { parseBody, parseValue, readJsonBody } from "../lib/http/validate";

export const crisisListRoutes = new Hono<AppEnv>();

crisisListRoutes.use("*", authMiddleware);

crisisListRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(crisisItems)
    .where(eq(crisisItems.childId, childId))
    .orderBy(asc(crisisItems.position));

  return c.json(result);
});

crisisListRoutes.post("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createCrisisItemSchema);

  await assertChildAccess(user.id, input.childId);

  // Auto-set position to end of list
  const [maxPos] = await db
    .select({ max: sql<number>`coalesce(max(${crisisItems.position}), -1)` })
    .from(crisisItems)
    .where(eq(crisisItems.childId, input.childId));

  const position = input.position ?? (maxPos?.max ?? -1) + 1;

  const [item] = await db
    .insert(crisisItems)
    .values({ ...input, position })
    .returning();

  if (item) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: item.childId,
      entityType: "crisis_item",
      entityId: item.id,
      action: "create",
      summary: "Liste de crise modifiée",
    });
  }

  return c.json(item, 201);
});

crisisListRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const input = await parseBody(c, updateCrisisItemSchema);

  const [existing] = await db
    .select()
    .from(crisisItems)
    .where(eq(crisisItems.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Élément non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(crisisItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(crisisItems.id, id))
    .returning();

  // The row can vanish between the ownership check and the update.
  if (!updated) {
    throw new AppError("NOT_FOUND", "Élément non trouvé", 404);
  }

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: updated.childId,
    entityType: "crisis_item",
    entityId: updated.id,
    action: "update",
    summary: "Liste de crise modifiée",
  });

  return c.json(updated);
});

crisisListRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(crisisItems)
    .where(eq(crisisItems.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Élément non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(crisisItems).where(eq(crisisItems.id, id));

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "crisis_item",
    entityId: existing.id,
    action: "delete",
    summary: "Liste de crise modifiée",
  });

  return c.json({ ok: true });
});

crisisListRoutes.post("/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const input = parseValue(reorderCrisisItemsSchema, {
    ...(await readJsonBody(c)),
    childId,
  });

  await assertChildAccess(user.id, childId);

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < input.orderedIds.length; i++) {
      await tx
        .update(crisisItems)
        .set({ position: i, updatedAt: new Date() })
        .where(
          and(
            eq(crisisItems.id, input.orderedIds[i]!),
            eq(crisisItems.childId, childId)
          )
        );
    }

    return tx
      .select()
      .from(crisisItems)
      .where(eq(crisisItems.childId, childId))
      .orderBy(asc(crisisItems.position));
  });

  return c.json(result);
});
