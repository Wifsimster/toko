import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, between } from "drizzle-orm";
import {
  db,
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
  children,
} from "@focusflow/db";
import {
  createBarkleyStepSchema,
  createBarkleyBehaviorSchema,
  updateBarkleyBehaviorSchema,
  createBarkleyBehaviorLogSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const barkleyRoutes = new Hono<AppEnv>();

barkleyRoutes.use("*", authMiddleware);

// ─── Helper ───────────────────────────────────────────────
async function verifyChildOwnership(childId: string, userId: string) {
  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, userId)));
  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }
  return child;
}

// ─── Steps ────────────────────────────────────────────────

barkleyRoutes.get("/steps/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await verifyChildOwnership(childId, user.id);

  const result = await db
    .select()
    .from(barkleySteps)
    .where(eq(barkleySteps.childId, childId));

  return c.json(result);
});

barkleyRoutes.post("/steps", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createBarkleyStepSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await verifyChildOwnership(parsed.data.childId, user.id);

  const [step] = await db
    .insert(barkleySteps)
    .values({
      ...parsed.data,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [barkleySteps.childId, barkleySteps.stepNumber],
      set: {
        completedAt: new Date(),
        notes: parsed.data.notes ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return c.json(step, 201);
});

barkleyRoutes.delete("/steps/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [step] = await db
    .select()
    .from(barkleySteps)
    .where(eq(barkleySteps.id, id));

  if (!step) {
    throw new AppError("NOT_FOUND", "Étape non trouvée", 404);
  }

  await verifyChildOwnership(step.childId, user.id);

  await db.delete(barkleySteps).where(eq(barkleySteps.id, id));

  return c.json({ success: true });
});

// ─── Behaviors ────────────────────────────────────────────

barkleyRoutes.get("/behaviors/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await verifyChildOwnership(childId, user.id);

  const result = await db
    .select()
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.childId, childId));

  return c.json(result);
});

barkleyRoutes.post("/behaviors", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createBarkleyBehaviorSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await verifyChildOwnership(parsed.data.childId, user.id);

  const [behavior] = await db
    .insert(barkleyBehaviors)
    .values(parsed.data)
    .returning();

  return c.json(behavior, 201);
});

barkleyRoutes.patch("/behaviors/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateBarkleyBehaviorSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.id, id));

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await verifyChildOwnership(behavior.childId, user.id);

  const [updated] = await db
    .update(barkleyBehaviors)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(barkleyBehaviors.id, id))
    .returning();

  return c.json(updated);
});

barkleyRoutes.delete("/behaviors/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.id, id));

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await verifyChildOwnership(behavior.childId, user.id);

  await db.delete(barkleyBehaviors).where(eq(barkleyBehaviors.id, id));

  return c.json({ success: true });
});

// ─── Behavior Logs ────────────────────────────────────────

barkleyRoutes.get("/logs/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const week = c.req.query("week");

  await verifyChildOwnership(childId, user.id);

  // Get behaviors for this child
  const behaviors = await db
    .select()
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.childId, childId));

  if (!behaviors.length) {
    return c.json({ behaviors: [], logs: [] });
  }

  const behaviorIds = behaviors.map((b) => b.id);

  // Compute week range (Monday to Sunday)
  let monday: string;
  let sunday: string;

  if (week) {
    const d = new Date(week);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    monday = d.toISOString().split("T")[0];
    d.setDate(d.getDate() + 6);
    sunday = d.toISOString().split("T")[0];
  } else {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    now.setDate(now.getDate() + diff);
    monday = now.toISOString().split("T")[0];
    now.setDate(now.getDate() + 6);
    sunday = now.toISOString().split("T")[0];
  }

  const logs = await db
    .select()
    .from(barkleyBehaviorLogs)
    .where(
      and(
        between(barkleyBehaviorLogs.date, monday, sunday),
        // Filter only logs for this child's behaviors
        ...[behaviorIds.length === 1
          ? eq(barkleyBehaviorLogs.behaviorId, behaviorIds[0])
          : undefined].filter(Boolean) as any[]
      )
    );

  // Filter logs to only include those belonging to this child's behaviors
  const behaviorIdSet = new Set(behaviorIds);
  const filteredLogs = logs.filter((l) => behaviorIdSet.has(l.behaviorId));

  return c.json({ behaviors, logs: filteredLogs });
});

barkleyRoutes.post("/logs", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createBarkleyBehaviorLogSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // Verify the behavior belongs to a child owned by the user
  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.id, parsed.data.behaviorId));

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await verifyChildOwnership(behavior.childId, user.id);

  const [log] = await db
    .insert(barkleyBehaviorLogs)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: [barkleyBehaviorLogs.behaviorId, barkleyBehaviorLogs.date],
      set: { completed: parsed.data.completed },
    })
    .returning();

  return c.json(log, 201);
});
