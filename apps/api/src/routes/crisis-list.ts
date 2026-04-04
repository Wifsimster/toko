import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, asc, sql } from "drizzle-orm";
import { db, crisisItems, children } from "@focusflow/db";
import {
  createCrisisItemSchema,
  updateCrisisItemSchema,
  reorderCrisisItemsSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const crisisListRoutes = new Hono<AppEnv>();

crisisListRoutes.use("*", authMiddleware);

crisisListRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const result = await db
    .select()
    .from(crisisItems)
    .where(eq(crisisItems.childId, childId))
    .orderBy(asc(crisisItems.position));

  return c.json(result);
});

crisisListRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createCrisisItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, parsed.data.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  // Auto-set position to end of list
  const [maxPos] = await db
    .select({ max: sql<number>`coalesce(max(${crisisItems.position}), -1)` })
    .from(crisisItems)
    .where(eq(crisisItems.childId, parsed.data.childId));

  const position = parsed.data.position ?? (maxPos?.max ?? -1) + 1;

  const [item] = await db
    .insert(crisisItems)
    .values({ ...parsed.data, position })
    .returning();

  return c.json(item, 201);
});

crisisListRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateCrisisItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(crisisItems)
    .where(eq(crisisItems.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Élément non trouvé", 404);
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, existing.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  const [updated] = await db
    .update(crisisItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(crisisItems.id, id))
    .returning();

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

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, existing.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  await db.delete(crisisItems).where(eq(crisisItems.id, id));
  return c.json({ ok: true });
});

crisisListRoutes.post("/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const body = await c.req.json();
  const parsed = reorderCrisisItemsSchema.safeParse({ ...body, childId });

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(crisisItems)
        .set({ position: i, updatedAt: new Date() })
        .where(
          and(
            eq(crisisItems.id, parsed.data.orderedIds[i]!),
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
