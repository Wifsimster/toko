import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, desc } from "drizzle-orm";
import { db, symptoms } from "@focusflow/db";
import {
  createSymptomSchema,
  updateSymptomSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";

export const symptomsRoutes = new Hono<AppEnv>();

symptomsRoutes.use("*", authMiddleware);

symptomsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 100, 1), 500);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  const result = await db
    .select()
    .from(symptoms)
    .where(eq(symptoms.childId, childId))
    .orderBy(desc(symptoms.date))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

symptomsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createSymptomSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const [symptom] = await db
    .insert(symptoms)
    .values(parsed.data)
    .returning();

  return c.json(symptom, 201);
});

symptomsRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateSymptomSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(symptoms)
    .where(eq(symptoms.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(symptoms)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(symptoms.id, id))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  return c.json(updated);
});

symptomsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(symptoms)
    .where(eq(symptoms.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(symptoms).where(eq(symptoms.id, id));
  return c.json({ ok: true });
});
