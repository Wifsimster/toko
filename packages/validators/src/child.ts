import { z } from "zod";

export const diagnosisTypeSchema = z.enum([
  "inattentive",
  "hyperactive",
  "mixed",
]);

export const createChildSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().date(),
  diagnosisType: diagnosisTypeSchema,
});

export const updateChildSchema = createChildSchema.partial();

export const childSchema = createChildSchema.extend({
  id: z.string().uuid(),
  parentId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DiagnosisType = z.infer<typeof diagnosisTypeSchema>;
export type CreateChild = z.infer<typeof createChildSchema>;
export type UpdateChild = z.infer<typeof updateChildSchema>;
export type Child = z.infer<typeof childSchema>;
