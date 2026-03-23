import { z } from "zod";

// --- Barkley Steps (program progression) ---

export const createBarkleyStepSchema = z.object({
  childId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(10),
  notes: z.string().max(2000).optional(),
});

export const barkleyStepSchema = createBarkleyStepSchema.extend({
  id: z.string().uuid(),
  completedAt: z.coerce.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

export type CreateBarkleyStep = z.infer<typeof createBarkleyStepSchema>;
export type BarkleyStep = z.infer<typeof barkleyStepSchema>;

// --- Barkley Behaviors (token board definitions) ---

export const createBarkleyBehaviorSchema = z.object({
  childId: z.string().uuid(),
  name: z.string().min(1).max(200),
  points: z.number().int().min(1).max(100).default(1),
  icon: z.string().max(10).optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateBarkleyBehaviorSchema = createBarkleyBehaviorSchema
  .partial()
  .omit({ childId: true })
  .extend({ active: z.boolean().optional() });

export const barkleyBehaviorSchema = createBarkleyBehaviorSchema.extend({
  id: z.string().uuid(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateBarkleyBehavior = z.input<typeof createBarkleyBehaviorSchema>;
export type UpdateBarkleyBehavior = z.infer<typeof updateBarkleyBehaviorSchema>;
export type BarkleyBehavior = z.infer<typeof barkleyBehaviorSchema>;

// --- Barkley Behavior Logs (daily check-offs) ---

export const createBarkleyBehaviorLogSchema = z.object({
  behaviorId: z.string().uuid(),
  date: z.string().date(),
  completed: z.boolean(),
});

export const barkleyBehaviorLogSchema = createBarkleyBehaviorLogSchema.extend({
  id: z.string().uuid(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type CreateBarkleyBehaviorLog = z.infer<
  typeof createBarkleyBehaviorLogSchema
>;
export type BarkleyBehaviorLog = z.infer<typeof barkleyBehaviorLogSchema>;
