import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, between, inArray, count, sql, asc, max } from "drizzle-orm";
import {
  db,
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
  barkleyRewards,
  children,
} from "@focusflow/db";
import {
  createBarkleyStepSchema,
  createBarkleyBehaviorSchema,
  updateBarkleyBehaviorSchema,
  createBarkleyBehaviorLogSchema,
  reorderBarkleyBehaviorsSchema,
  createBarkleyRewardSchema,
  updateBarkleyRewardSchema,
  reorderBarkleyRewardsSchema,
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
    .where(eq(barkleyBehaviors.childId, childId))
    .orderBy(asc(barkleyBehaviors.sortOrder));

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

// ─── Behavior Reorder ────────────────────────────────────

barkleyRoutes.post("/behaviors/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const body = await c.req.json();
  const parsed = reorderBarkleyBehaviorsSchema.safeParse({ ...body, childId });

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await verifyChildOwnership(childId, user.id);

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(barkleyBehaviors)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(barkleyBehaviors.id, parsed.data.orderedIds[i]!),
            eq(barkleyBehaviors.childId, childId)
          )
        );
    }

    return tx
      .select()
      .from(barkleyBehaviors)
      .where(eq(barkleyBehaviors.childId, childId))
      .orderBy(asc(barkleyBehaviors.sortOrder));
  });

  return c.json(result);
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
    .where(eq(barkleyBehaviors.childId, childId))
    .orderBy(asc(barkleyBehaviors.sortOrder));

  if (!behaviors.length) {
    return c.json({ behaviors: [], logs: [] });
  }

  const behaviorIds = behaviors.map((b) => b.id);

  // Compute week range (Monday to Sunday)
  function toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  const ref = week ? new Date(week) : new Date();
  const day = ref.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  ref.setDate(ref.getDate() + diff);
  const monday = toDateString(ref);
  ref.setDate(ref.getDate() + 6);
  const sunday = toDateString(ref);

  const logs = await db
    .select()
    .from(barkleyBehaviorLogs)
    .where(
      and(
        inArray(barkleyBehaviorLogs.behaviorId, behaviorIds),
        between(barkleyBehaviorLogs.date, monday, sunday)
      )
    );

  return c.json({ behaviors, logs });
});

// ─── Rewards ─────────────────────────────────────────────

barkleyRoutes.get("/rewards/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await verifyChildOwnership(childId, user.id);

  const result = await db
    .select()
    .from(barkleyRewards)
    .where(eq(barkleyRewards.childId, childId))
    .orderBy(asc(barkleyRewards.sortOrder));

  return c.json(result);
});

barkleyRoutes.post("/rewards", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createBarkleyRewardSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await verifyChildOwnership(parsed.data.childId, user.id);

  // Auto-assign sortOrder to MAX + 1
  const [maxResult] = await db
    .select({ maxOrder: max(barkleyRewards.sortOrder) })
    .from(barkleyRewards)
    .where(eq(barkleyRewards.childId, parsed.data.childId));

  const nextOrder = (maxResult?.maxOrder ?? -1) + 1;

  const [reward] = await db
    .insert(barkleyRewards)
    .values({ ...parsed.data, sortOrder: nextOrder })
    .returning();

  return c.json(reward, 201);
});

barkleyRoutes.patch("/rewards/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateBarkleyRewardSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [reward] = await db
    .select()
    .from(barkleyRewards)
    .where(eq(barkleyRewards.id, id));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await verifyChildOwnership(reward.childId, user.id);

  if (reward.claimedAt) {
    throw new AppError("CONFLICT", "Impossible de modifier une récompense déjà réclamée", 409);
  }

  const [updated] = await db
    .update(barkleyRewards)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(barkleyRewards.id, id))
    .returning();

  return c.json(updated);
});

barkleyRoutes.post("/rewards/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const body = await c.req.json();
  const parsed = reorderBarkleyRewardsSchema.safeParse({ ...body, childId });

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await verifyChildOwnership(childId, user.id);

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(barkleyRewards)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(barkleyRewards.id, parsed.data.orderedIds[i]!),
            eq(barkleyRewards.childId, childId)
          )
        );
    }

    return tx
      .select()
      .from(barkleyRewards)
      .where(eq(barkleyRewards.childId, childId))
      .orderBy(asc(barkleyRewards.sortOrder));
  });

  return c.json(result);
});

barkleyRoutes.delete("/rewards/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [reward] = await db
    .select()
    .from(barkleyRewards)
    .where(eq(barkleyRewards.id, id));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await verifyChildOwnership(reward.childId, user.id);

  await db.delete(barkleyRewards).where(eq(barkleyRewards.id, id));

  return c.json({ success: true });
});

// ─── Cumulative Stars ────────────────────────────────────

barkleyRoutes.get("/stars/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await verifyChildOwnership(childId, user.id);

  const behaviors = await db
    .select({ id: barkleyBehaviors.id })
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.childId, childId));

  if (!behaviors.length) {
    return c.json({ totalStars: 0 });
  }

  const behaviorIds = behaviors.map((b) => b.id);

  const [result] = await db
    .select({ total: count() })
    .from(barkleyBehaviorLogs)
    .where(
      and(
        inArray(barkleyBehaviorLogs.behaviorId, behaviorIds),
        eq(barkleyBehaviorLogs.completed, true)
      )
    );

  return c.json({ totalStars: result?.total ?? 0 });
});

// ─── Claim Reward ────────────────────────────────────────

barkleyRoutes.post("/rewards/:id/claim", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [reward] = await db
    .select()
    .from(barkleyRewards)
    .where(eq(barkleyRewards.id, id));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await verifyChildOwnership(reward.childId, user.id);

  if (reward.claimedAt) {
    return c.json({ error: "Récompense déjà réclamée" }, 409);
  }

  // Use transaction to prevent race conditions
  const updated = await db.transaction(async (tx) => {
    const behaviors = await tx
      .select({ id: barkleyBehaviors.id })
      .from(barkleyBehaviors)
      .where(eq(barkleyBehaviors.childId, reward.childId));

    const behaviorIds = behaviors.map((b) => b.id);
    let totalStars = 0;

    if (behaviorIds.length) {
      const [result] = await tx
        .select({ total: count() })
        .from(barkleyBehaviorLogs)
        .where(
          and(
            inArray(barkleyBehaviorLogs.behaviorId, behaviorIds),
            eq(barkleyBehaviorLogs.completed, true)
          )
        );
      totalStars = result?.total ?? 0;
    }

    if (totalStars < reward.starsRequired) {
      throw new AppError(
        "INSUFFICIENT_STARS",
        `Pas assez d'étoiles (${totalStars}/${reward.starsRequired})`,
        422
      );
    }

    const [claimed] = await tx
      .update(barkleyRewards)
      .set({ claimedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(barkleyRewards.id, id), sql`${barkleyRewards.claimedAt} IS NULL`))
      .returning();

    if (!claimed) {
      throw new AppError("CONFLICT", "Récompense déjà réclamée", 409);
    }

    return claimed;
  });

  return c.json(updated);
});

// ─── Behavior Logs ────────────────────────────────────────

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
