import { z } from "zod";

export const TIME_OF_DAY = [
  "morning",
  "noon",
  "evening",
  "bedtime",
  "anytime",
] as const;

const dayOfWeek = z.number().int().min(0).max(6);

export const createRoutineStepInputSchema = z.object({
  label: z.string().min(1).max(120),
  emoji: z.string().max(10).optional(),
  durationMinutes: z.number().int().min(1).max(180).optional(),
  position: z.number().int().min(0).optional(),
});

export const createRoutineSchema = z.object({
  childId: z.string().uuid(),
  name: z.string().min(1).max(120),
  emoji: z.string().max(10).optional(),
  timeOfDay: z.enum(TIME_OF_DAY).default("morning"),
  daysOfWeek: z.array(dayOfWeek).max(7).optional().default([]),
  steps: z.array(createRoutineStepInputSchema).max(20).optional().default([]),
});

export const updateRoutineSchema = z
  .object({
    name: z.string().min(1).max(120),
    emoji: z.string().max(10).nullable(),
    timeOfDay: z.enum(TIME_OF_DAY),
    daysOfWeek: z.array(dayOfWeek).max(7),
    active: z.boolean(),
    position: z.number().int().min(0),
  })
  .partial();

export const upsertRoutineStepsSchema = z.object({
  steps: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        label: z.string().min(1).max(120),
        emoji: z.string().max(10).nullable().optional(),
        durationMinutes: z
          .number()
          .int()
          .min(1)
          .max(180)
          .nullable()
          .optional(),
      }),
    )
    .max(20),
});

export const completeRoutineStepSchema = z.object({
  stepId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue YYYY-MM-DD"),
});

export const uncompleteRoutineStepSchema = completeRoutineStepSchema;

export const routineStepSchema = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  label: z.string(),
  emoji: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const routineSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  name: z.string(),
  emoji: z.string().nullable(),
  timeOfDay: z.enum(TIME_OF_DAY),
  daysOfWeek: z.array(dayOfWeek),
  position: z.number().int(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  steps: z.array(routineStepSchema),
  // Display name of the parent who created this routine. Surfaced on the card
  // when the child is shared with a co-parent so the family can see who
  // logged what.
  createdByName: z.string().nullable().optional(),
});

export const routineCompletionSchema = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  stepId: z.string().uuid(),
  childId: z.string().uuid(),
  date: z.string(),
  completedAt: z.string(),
});

export type TimeOfDay = (typeof TIME_OF_DAY)[number];
export type CreateRoutine = z.infer<typeof createRoutineSchema>;
export type UpdateRoutine = z.infer<typeof updateRoutineSchema>;
export type UpsertRoutineSteps = z.infer<typeof upsertRoutineStepsSchema>;
export type CompleteRoutineStep = z.infer<typeof completeRoutineStepSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type RoutineStep = z.infer<typeof routineStepSchema>;
export type RoutineCompletion = z.infer<typeof routineCompletionSchema>;
