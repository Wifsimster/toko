import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, symptoms, children } from "@focusflow/db";
import {
  createSymptomSchema,
  updateSymptomSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const symptomsRoutes = new Hono();

symptomsRoutes.use("*", authMiddleware);

symptomsRoutes.get("/:childId", async (c) => {
  const user = c.get("user") as { id: string };
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
    .from(symptoms)
    .where(eq(symptoms.childId, childId));

  return c.json(result);
});

symptomsRoutes.post("/", async (c) => {
  const user = c.get("user") as { id: string };
  const body = await c.req.json();
  const parsed = createSymptomSchema.safeParse(body);

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

  const [symptom] = await db
    .insert(symptoms)
    .values(parsed.data)
    .returning();

  return c.json(symptom, 201);
});
