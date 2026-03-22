import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and } from "drizzle-orm";
import { db, medication, medicationLogs, children } from "@focusflow/db";
import {
  createMedicationSchema,
  createMedicationLogSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const medicationsRoutes = new Hono<AppEnv>();

medicationsRoutes.use("*", authMiddleware);

medicationsRoutes.get("/:childId", async (c) => {
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
    .from(medication)
    .where(eq(medication.childId, childId));

  return c.json(result);
});

medicationsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createMedicationSchema.safeParse(body);

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

  const [med] = await db
    .insert(medication)
    .values(parsed.data)
    .returning();

  return c.json(med, 201);
});

medicationsRoutes.post("/log", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createMedicationLogSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // Verify the medication belongs to a child owned by the user
  const [med] = await db
    .select()
    .from(medication)
    .where(eq(medication.id, parsed.data.medicationId));

  if (!med) {
    throw new AppError("NOT_FOUND", "Médicament non trouvé", 404);
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, med.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  const [log] = await db
    .insert(medicationLogs)
    .values({
      ...parsed.data,
      takenAt: parsed.data.takenAt ? new Date(parsed.data.takenAt) : null,
    })
    .returning();

  return c.json(log, 201);
});
