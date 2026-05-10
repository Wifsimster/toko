import { Hono } from "hono";
import { eq, and, asc, sql, inArray } from "drizzle-orm";
import {
  db,
  routines,
  routineSteps,
  routineCompletions,
} from "@focusflow/db";
import {
  createRoutineSchema,
  updateRoutineSchema,
  upsertRoutineStepsSchema,
  completeRoutineStepSchema,
  adoptRoutineTemplateSchema,
  findRoutineTemplate,
} from "@focusflow/validators";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";

export const routinesRoutes = new Hono<AppEnv>();

routinesRoutes.use("*", authMiddleware);

async function loadRoutineWithSteps(routineId: string) {
  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, routineId));
  if (!routine) return null;

  const steps = await db
    .select()
    .from(routineSteps)
    .where(eq(routineSteps.routineId, routineId))
    .orderBy(asc(routineSteps.position));

  return { ...routine, steps };
}

async function loadRoutinesWithSteps(childId: string) {
  const list = await db
    .select()
    .from(routines)
    .where(eq(routines.childId, childId))
    .orderBy(asc(routines.position), asc(routines.createdAt));

  if (list.length === 0) return [];

  const ids = list.map((r) => r.id);
  const steps = await db
    .select()
    .from(routineSteps)
    .where(inArray(routineSteps.routineId, ids))
    .orderBy(asc(routineSteps.position));

  const stepsByRoutine = new Map<string, typeof steps>();
  for (const s of steps) {
    const arr = stepsByRoutine.get(s.routineId) ?? [];
    arr.push(s);
    stepsByRoutine.set(s.routineId, arr);
  }

  return list.map((r) => ({ ...r, steps: stepsByRoutine.get(r.id) ?? [] }));
}

// ─── List routines for a child ──────────────────────────────────────────────
routinesRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  await assertChildAccess(user.id, childId);

  const list = await loadRoutinesWithSteps(childId);
  return c.json(list);
});

// ─── Today's completions for a child ────────────────────────────────────────
routinesRoutes.get("/:childId/completions", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  await assertChildAccess(user.id, childId);

  const date = c.req.query("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("BAD_REQUEST", "Date YYYY-MM-DD requise", 400);
  }

  const rows = await db
    .select()
    .from(routineCompletions)
    .where(
      and(
        eq(routineCompletions.childId, childId),
        eq(routineCompletions.date, date),
      ),
    );

  return c.json(rows);
});

// ─── Create a routine (with optional inline steps) ──────────────────────────
routinesRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createRoutineSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }
  await assertChildAccess(user.id, parsed.data.childId);

  const [maxPos] = await db
    .select({ max: sql<number>`coalesce(max(${routines.position}), -1)` })
    .from(routines)
    .where(eq(routines.childId, parsed.data.childId));
  const position = (maxPos?.max ?? -1) + 1;

  const created = await db.transaction(async (tx) => {
    const [routine] = await tx
      .insert(routines)
      .values({
        childId: parsed.data.childId,
        name: parsed.data.name,
        emoji: parsed.data.emoji,
        timeOfDay: parsed.data.timeOfDay,
        daysOfWeek: parsed.data.daysOfWeek,
        position,
      })
      .returning();

    if (!routine) {
      throw new AppError("INTERNAL", "Création échouée", 500);
    }

    const steps = parsed.data.steps;
    if (steps.length > 0) {
      await tx.insert(routineSteps).values(
        steps.map((s, i) => ({
          routineId: routine.id,
          label: s.label,
          emoji: s.emoji,
          durationMinutes: s.durationMinutes,
          position: s.position ?? i,
        })),
      );
    }

    return routine;
  });

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: created.childId,
    entityType: "routine",
    entityId: created.id,
    action: "create",
    summary: `Routine « ${created.name} » créée`,
  });

  const full = await loadRoutineWithSteps(created.id);
  return c.json(full, 201);
});

// ─── Adopt a built-in template ─────────────────────────────────────────────
// One-tap path from the empty state: turns a curated template (matin / devoirs
// / coucher / …) into a full routine + steps in a single transaction. The
// template content lives in @focusflow/validators so FE and BE agree.
routinesRoutes.post("/from-template", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = adoptRoutineTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }
  await assertChildAccess(user.id, parsed.data.childId);

  const template = findRoutineTemplate(parsed.data.templateKey);
  if (!template) {
    throw new AppError("NOT_FOUND", "Modèle introuvable", 404);
  }

  const [maxPos] = await db
    .select({ max: sql<number>`coalesce(max(${routines.position}), -1)` })
    .from(routines)
    .where(eq(routines.childId, parsed.data.childId));
  const position = (maxPos?.max ?? -1) + 1;

  const created = await db.transaction(async (tx) => {
    const [routine] = await tx
      .insert(routines)
      .values({
        childId: parsed.data.childId,
        name: template.title,
        emoji: template.emoji,
        timeOfDay: template.timeOfDay,
        daysOfWeek: template.daysOfWeek ?? [],
        position,
      })
      .returning();

    if (!routine) {
      throw new AppError("INTERNAL", "Création échouée", 500);
    }

    if (template.steps.length > 0) {
      await tx.insert(routineSteps).values(
        template.steps.map((s, i) => ({
          routineId: routine.id,
          label: s.label,
          emoji: s.emoji ?? null,
          durationMinutes: s.durationMinutes ?? null,
          position: i,
        })),
      );
    }

    return routine;
  });

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: created.childId,
    entityType: "routine",
    entityId: created.id,
    action: "create",
    summary: `Routine « ${created.name} » ajoutée depuis un modèle`,
  });

  const full = await loadRoutineWithSteps(created.id);
  return c.json(full, 201);
});

// ─── Update routine metadata ───────────────────────────────────────────────
routinesRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateRoutineSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [existing] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, id));
  if (!existing) throw new AppError("NOT_FOUND", "Routine introuvable", 404);
  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(routines)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(routines.id, id))
    .returning();

  if (updated) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: updated.childId,
      entityType: "routine",
      entityId: updated.id,
      action: "update",
      summary: `Routine « ${updated.name} » modifiée`,
    });
  }

  const full = await loadRoutineWithSteps(id);
  return c.json(full);
});

// ─── Replace the full step list ────────────────────────────────────────────
// Single endpoint rather than per-step CRUD: the editor always saves the
// whole list, which keeps positions consistent and avoids step-level races.
routinesRoutes.patch("/:id/steps", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = upsertRoutineStepsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [existing] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, id));
  if (!existing) throw new AppError("NOT_FOUND", "Routine introuvable", 404);
  await assertChildAccess(user.id, existing.childId);

  await db.transaction(async (tx) => {
    const current = await tx
      .select({ id: routineSteps.id })
      .from(routineSteps)
      .where(eq(routineSteps.routineId, id));
    const currentIds = new Set(current.map((s) => s.id));
    const incomingIds = new Set(
      parsed.data.steps.map((s) => s.id).filter(Boolean) as string[],
    );

    const toDelete = [...currentIds].filter((cid) => !incomingIds.has(cid));
    if (toDelete.length > 0) {
      await tx
        .delete(routineSteps)
        .where(inArray(routineSteps.id, toDelete));
    }

    for (let i = 0; i < parsed.data.steps.length; i++) {
      const s = parsed.data.steps[i]!;
      if (s.id && currentIds.has(s.id)) {
        await tx
          .update(routineSteps)
          .set({
            label: s.label,
            emoji: s.emoji ?? null,
            durationMinutes: s.durationMinutes ?? null,
            position: i,
            updatedAt: new Date(),
          })
          .where(eq(routineSteps.id, s.id));
      } else {
        await tx.insert(routineSteps).values({
          routineId: id,
          label: s.label,
          emoji: s.emoji ?? null,
          durationMinutes: s.durationMinutes ?? null,
          position: i,
        });
      }
    }

    await tx
      .update(routines)
      .set({ updatedAt: new Date() })
      .where(eq(routines.id, id));
  });

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "routine",
    entityId: existing.id,
    action: "update",
    summary: `Étapes de « ${existing.name} » mises à jour`,
  });

  const full = await loadRoutineWithSteps(id);
  return c.json(full);
});

// ─── Delete routine ─────────────────────────────────────────────────────────
routinesRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, id));
  if (!existing) throw new AppError("NOT_FOUND", "Routine introuvable", 404);
  await assertChildAccess(user.id, existing.childId);

  await db.delete(routines).where(eq(routines.id, id));

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "routine",
    entityId: existing.id,
    action: "delete",
    summary: `Routine « ${existing.name} » supprimée`,
  });

  return c.json({ ok: true });
});

// ─── Mark a step done for a date ───────────────────────────────────────────
routinesRoutes.post("/:id/complete", async (c) => {
  const user = c.get("user");
  const routineId = c.req.param("id");
  const body = await c.req.json();
  const parsed = completeRoutineStepSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, routineId));
  if (!routine) throw new AppError("NOT_FOUND", "Routine introuvable", 404);
  await assertChildAccess(user.id, routine.childId);

  const [step] = await db
    .select()
    .from(routineSteps)
    .where(
      and(
        eq(routineSteps.id, parsed.data.stepId),
        eq(routineSteps.routineId, routineId),
      ),
    );
  if (!step) throw new AppError("NOT_FOUND", "Étape introuvable", 404);

  // Unique(step_id, date) makes this idempotent — second tap is a no-op.
  const [completion] = await db
    .insert(routineCompletions)
    .values({
      routineId,
      stepId: step.id,
      childId: routine.childId,
      date: parsed.data.date,
    })
    .onConflictDoNothing()
    .returning();

  return c.json(completion ?? { ok: true }, 201);
});

// ─── Untick a step (mistake undo) ──────────────────────────────────────────
routinesRoutes.post("/:id/uncomplete", async (c) => {
  const user = c.get("user");
  const routineId = c.req.param("id");
  const body = await c.req.json();
  const parsed = completeRoutineStepSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, routineId));
  if (!routine) throw new AppError("NOT_FOUND", "Routine introuvable", 404);
  await assertChildAccess(user.id, routine.childId);

  await db
    .delete(routineCompletions)
    .where(
      and(
        eq(routineCompletions.routineId, routineId),
        eq(routineCompletions.stepId, parsed.data.stepId),
        eq(routineCompletions.date, parsed.data.date),
      ),
    );

  return c.json({ ok: true });
});
