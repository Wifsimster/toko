import { z } from "zod";

export const npsCohortSchema = z.enum(["d30", "d90", "d365"]);

export const submitNpsSchema = z.object({
  cohort: npsCohortSchema,
  score: z.number().int().min(0).max(10).nullable(),
  feedback: z.string().max(2000).optional(),
});

export type NpsCohort = z.infer<typeof npsCohortSchema>;
export type SubmitNps = z.infer<typeof submitNpsSchema>;
