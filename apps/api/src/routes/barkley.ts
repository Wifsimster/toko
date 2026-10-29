import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, between, inArray, count, sql, asc, max, gte, isNull } from "drizzle-orm";
import {
  db,
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
  barkleyRewards,
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
import { assertChildAccess, getChildOwnerId } from "../lib/child-access";
import { getFormationAccess } from "../lib/premium";
import { parseBody, parseValue, readJsonBody } from "../lib/http/validate";
import {
  getUserTimezone,
  localISODateDaysAgo,
  toLocalISODate,
} from "../lib/local-date";

export const barkleyRoutes = new Hono<AppEnv>();

const liveBehaviorsOf = (childId: string) =>
  and(eq(barkleyBehaviors.childId, childId), isNull(barkleyBehaviors.archivedAt));
const liveRewardsOf = (childId: string) =>
  and(eq(barkleyRewards.childId, childId), isNull(barkleyRewards.archivedAt));

type Executor = Pick<typeof db, "select">;

async function computeStarBalance(executor: Executor, childId: string) {
  const [earned] = await executor
    .select({ total: count() })
    .from(barkleyBehaviorLogs)
    .innerJoin(
      barkleyBehaviors,
      eq(barkleyBehaviorLogs.behaviorId, barkleyBehaviors.id)
    )
    .where(
      and(
        eq(barkleyBehaviors.childId, childId),
        eq(barkleyBehaviorLogs.completed, true)
      )
    );

  const [spent] = await executor
    .select({
      spent: sql<number>`COALESCE(SUM(${barkleyRewards.starsSpent}), 0)::int`,
    })
    .from(barkleyRewards)
    .where(eq(barkleyRewards.childId, childId));

  const totalStars = earned?.total ?? 0;
  const spentStars = Number(spent?.spent ?? 0);
  return {
    totalStars,
    spentStars,
    availableStars: Math.max(0, totalStars - spentStars),
  };
}

async function childHasFormation(userId: string, childId: string) {
  const ownerId = (await getChildOwnerId(childId)) ?? userId;
  if ((await getFormationAccess(ownerId)).ownsFormation) return true;
  if (ownerId === userId) return false;
  return (await getFormationAccess(userId)).ownsFormation;
}

barkleyRoutes.use("*", authMiddleware);

barkleyRoutes.get("/steps/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(barkleySteps)
    .where(eq(barkleySteps.childId, childId));

  return c.json(result);
});

barkleyRoutes.post("/steps", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createBarkleyStepSchema);

  await assertChildAccess(user.id, input.childId);

  if (!(await childHasFormation(user.id, input.childId))) {
    return c.json(
      {
        error: "Débloquez la formation pour suivre votre progression.",
        code: "FORMATION_REQUIRED",
        upgrade: true,
      },
      403,
    );
  }

  const [step] = await db
    .insert(barkleySteps)
    .values({
      ...input,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [barkleySteps.childId, barkleySteps.stepNumber],
      set: {
        completedAt: new Date(),
        notes: input.notes ?? null,
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

  await assertChildAccess(user.id, step.childId);

  await db.delete(barkleySteps).where(eq(barkleySteps.id, id));

  return c.json({ success: true });
});

barkleyRoutes.get("/behaviors/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(barkleyBehaviors)
    .where(liveBehaviorsOf(childId))
    .orderBy(asc(barkleyBehaviors.sortOrder));

  return c.json(result);
});

barkleyRoutes.post("/behaviors", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createBarkleyBehaviorSchema);

  await assertChildAccess(user.id, input.childId);

  const [behavior] = await db
    .insert(barkleyBehaviors)
    .values(input)
    .returning();

  return c.json(behavior, 201);
});

barkleyRoutes.patch("/behaviors/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const input = await parseBody(c, updateBarkleyBehaviorSchema);

  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(and(eq(barkleyBehaviors.id, id), isNull(barkleyBehaviors.archivedAt)));

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await assertChildAccess(user.id, behavior.childId);

  const [updated] = await db
    .update(barkleyBehaviors)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(barkleyBehaviors.id, id), isNull(barkleyBehaviors.archivedAt)))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  return c.json(updated);
});

barkleyRoutes.delete("/behaviors/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(and(eq(barkleyBehaviors.id, id), isNull(barkleyBehaviors.archivedAt)));

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await assertChildAccess(user.id, behavior.childId);

  const [earned] = await db
    .select({ n: count() })
    .from(barkleyBehaviorLogs)
    .where(
      and(
        eq(barkleyBehaviorLogs.behaviorId, id),
        eq(barkleyBehaviorLogs.completed, true)
      )
    );

  if ((earned?.n ?? 0) > 0) {
    await db
      .update(barkleyBehaviors)
      .set({ archivedAt: new Date(), active: false, updatedAt: new Date() })
      .where(eq(barkleyBehaviors.id, id));
  } else {
    await db.delete(barkleyBehaviors).where(eq(barkleyBehaviors.id, id));
  }

  return c.json({ success: true });
});

barkleyRoutes.post("/behaviors/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const input = parseValue(reorderBarkleyBehaviorsSchema, {
    ...(await readJsonBody(c)),
    childId,
  });

  await assertChildAccess(user.id, childId);

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < input.orderedIds.length; i++) {
      await tx
        .update(barkleyBehaviors)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(barkleyBehaviors.id, input.orderedIds[i]!),
            eq(barkleyBehaviors.childId, childId)
          )
        );
    }

    return tx
      .select()
      .from(barkleyBehaviors)
      .where(liveBehaviorsOf(childId))
      .orderBy(asc(barkleyBehaviors.sortOrder));
  });

  return c.json(result);
});

barkleyRoutes.get("/logs/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const week = c.req.query("week");

  await assertChildAccess(user.id, childId);

  const behaviors = await db
    .select()
    .from(barkleyBehaviors)
    .where(liveBehaviorsOf(childId))
    .orderBy(asc(barkleyBehaviors.sortOrder));

  if (!behaviors.length) {
    return c.json({ behaviors: [], logs: [] });
  }

  const behaviorIds = behaviors.map((b) => b.id);

  const tz = await getUserTimezone(user.id);
  if (week !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    throw new AppError("BAD_REQUEST", "Semaine invalide (format YYYY-MM-DD)", 400);
  }
  const refDate = week ?? toLocalISODate(tz);
  const ref = new Date(`${refDate}T00:00:00Z`);
  if (Number.isNaN(ref.getTime())) {
    throw new AppError("BAD_REQUEST", "Semaine invalide (date inexistante)", 400);
  }
  const day = ref.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  ref.setUTCDate(ref.getUTCDate() + diff);
  const monday = ref.toISOString().slice(0, 10);
  ref.setUTCDate(ref.getUTCDate() + 6);
  const sunday = ref.toISOString().slice(0, 10);

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

barkleyRoutes.get("/rewards/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(barkleyRewards)
    .where(liveRewardsOf(childId))
    .orderBy(asc(barkleyRewards.sortOrder));

  return c.json(result);
});

barkleyRoutes.post("/rewards", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createBarkleyRewardSchema);

  await assertChildAccess(user.id, input.childId);

  const [maxResult] = await db
    .select({ maxOrder: max(barkleyRewards.sortOrder) })
    .from(barkleyRewards)
    .where(liveRewardsOf(input.childId));

  const nextOrder = (maxResult?.maxOrder ?? -1) + 1;

  const [reward] = await db
    .insert(barkleyRewards)
    .values({ ...input, sortOrder: nextOrder })
    .returning();

  return c.json(reward, 201);
});

barkleyRoutes.patch("/rewards/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const input = await parseBody(c, updateBarkleyRewardSchema);

  const [reward] = await db
    .select()
    .from(barkleyRewards)
    .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await assertChildAccess(user.id, reward.childId);

  const [updated] = await db
    .update(barkleyRewards)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  return c.json(updated);
});

barkleyRoutes.post("/rewards/:childId/reorder", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const input = parseValue(reorderBarkleyRewardsSchema, {
    ...(await readJsonBody(c)),
    childId,
  });

  await assertChildAccess(user.id, childId);

  const result = await db.transaction(async (tx) => {
    for (let i = 0; i < input.orderedIds.length; i++) {
      await tx
        .update(barkleyRewards)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(barkleyRewards.id, input.orderedIds[i]!),
            eq(barkleyRewards.childId, childId)
          )
        );
    }

    return tx
      .select()
      .from(barkleyRewards)
      .where(liveRewardsOf(childId))
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
    .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await assertChildAccess(user.id, reward.childId);

  if (reward.timesClaimed > 0 || reward.starsSpent > 0) {
    await db
      .update(barkleyRewards)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(barkleyRewards.id, id));
  } else {
    await db.delete(barkleyRewards).where(eq(barkleyRewards.id, id));
  }

  return c.json({ success: true });
});

barkleyRoutes.get("/stars/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const { totalStars, spentStars, availableStars } = await computeStarBalance(
    db,
    childId
  );

  const tz = await getUserTimezone(user.id);
  const weekStart = localISODateDaysAgo(tz, 6);
  const [weeklyResult] = await db
    .select({ total: count() })
    .from(barkleyBehaviorLogs)
    .innerJoin(
      barkleyBehaviors,
      eq(barkleyBehaviorLogs.behaviorId, barkleyBehaviors.id)
    )
    .where(
      and(
        eq(barkleyBehaviors.childId, childId),
        eq(barkleyBehaviorLogs.completed, true),
        gte(barkleyBehaviorLogs.date, weekStart)
      )
    );
  const weeklyStars = weeklyResult?.total ?? 0;

  return c.json({ totalStars, spentStars, availableStars, weeklyStars });
});

barkleyRoutes.post("/rewards/:id/claim", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [reward] = await db
    .select()
    .from(barkleyRewards)
    .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)));

  if (!reward) {
    throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
  }

  await assertChildAccess(user.id, reward.childId);

  const updated = await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${reward.childId}))`
    );

    const [current] = await tx
      .select({ starsRequired: barkleyRewards.starsRequired })
      .from(barkleyRewards)
      .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)));
    if (!current) {
      throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
    }
    const price = current.starsRequired;

    const { availableStars } = await computeStarBalance(tx, reward.childId);

    if (availableStars < price) {
      throw new AppError(
        "INSUFFICIENT_STARS",
        `Solde insuffisant (${availableStars}/${price})`,
        422
      );
    }

    const [claimed] = await tx
      .update(barkleyRewards)
      .set({
        claimedAt: new Date(),
        timesClaimed: sql`${barkleyRewards.timesClaimed} + 1`,
        starsSpent: sql`${barkleyRewards.starsSpent} + ${price}`,
        updatedAt: new Date(),
      })
      .where(and(eq(barkleyRewards.id, id), isNull(barkleyRewards.archivedAt)))
      .returning();

    if (!claimed) {
      throw new AppError("NOT_FOUND", "Récompense non trouvée", 404);
    }

    return claimed;
  });

  return c.json(updated);
});

barkleyRoutes.post("/logs", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createBarkleyBehaviorLogSchema);

  const [behavior] = await db
    .select()
    .from(barkleyBehaviors)
    .where(
      and(
        eq(barkleyBehaviors.id, input.behaviorId),
        isNull(barkleyBehaviors.archivedAt)
      )
    );

  if (!behavior) {
    throw new AppError("NOT_FOUND", "Comportement non trouvé", 404);
  }

  await assertChildAccess(user.id, behavior.childId);

  const [log] = await db
    .insert(barkleyBehaviorLogs)
    .values(input)
    .onConflictDoUpdate({
      target: [barkleyBehaviorLogs.behaviorId, barkleyBehaviorLogs.date],
      set: { completed: input.completed },
    })
    .returning();

  return c.json(log, 201);
});
