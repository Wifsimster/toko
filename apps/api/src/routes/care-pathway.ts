import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and } from "drizzle-orm";
import { db, carePathwayProgress } from "@focusflow/db";
import { upsertCarePathwayProgressSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { assertChildAccess } from "../lib/child-access";

export const carePathwayRoutes = new Hono<AppEnv>();

carePathwayRoutes.use("*", authMiddleware);

carePathwayRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const rows = await db
    .select()
    .from(carePathwayProgress)
    .where(eq(carePathwayProgress.childId, childId));

  return c.json(rows);
});

carePathwayRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = upsertCarePathwayProgressSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const completedAt = parsed.data.status === "done" ? new Date() : null;

  // Upsert on (childId, stepId). The unique index ensures a single row per
  // step. We deliberately reset completedAt when the status leaves "done"
  // so the timeline reflects the latest state.
  const [existing] = await db
    .select()
    .from(carePathwayProgress)
    .where(
      and(
        eq(carePathwayProgress.childId, parsed.data.childId),
        eq(carePathwayProgress.stepId, parsed.data.stepId),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(carePathwayProgress)
      .set({
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(carePathwayProgress.id, existing.id))
      .returning();
    return c.json(updated);
  }

  const [inserted] = await db
    .insert(carePathwayProgress)
    .values({
      childId: parsed.data.childId,
      stepId: parsed.data.stepId,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      completedAt,
    })
    .returning();

  return c.json(inserted, 201);
});
