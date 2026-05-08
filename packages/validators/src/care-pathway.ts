import { z } from "zod";

export const careStepStatusSchema = z.enum(["todo", "doing", "done"]);

export const upsertCarePathwayProgressSchema = z.object({
  childId: z.string().uuid(),
  stepId: z.string().min(1).max(100),
  status: careStepStatusSchema,
  notes: z.string().max(2000).optional(),
});

export const carePathwayProgressSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  stepId: z.string(),
  status: careStepStatusSchema,
  notes: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CareStepStatus = z.infer<typeof careStepStatusSchema>;
export type UpsertCarePathwayProgress = z.infer<
  typeof upsertCarePathwayProgressSchema
>;
export type CarePathwayProgress = z.infer<typeof carePathwayProgressSchema>;
