import { z } from "zod";

const ratingScale = z.number().int().min(0).max(10);

export const createSymptomSchema = z.object({
  childId: z.string().uuid(),
  date: z.string().date(),
  agitation: ratingScale,
  focus: ratingScale,
  impulse: ratingScale,
  mood: ratingScale,
  sleep: ratingScale,
  routinesOk: z.boolean().default(true),
  context: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateSymptomSchema = createSymptomSchema.partial().omit({
  childId: true,
});

export const symptomSchema = createSymptomSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateSymptom = z.infer<typeof createSymptomSchema>;
export type UpdateSymptom = z.infer<typeof updateSymptomSchema>;
export type Symptom = z.infer<typeof symptomSchema>;
