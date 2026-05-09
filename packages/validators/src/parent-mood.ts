import { z } from "zod";

export const parentMoodScoreSchema = z.number().int().min(1).max(5);

export const upsertParentMoodSchema = z.object({
  date: z.string().date(),
  score: parentMoodScoreSchema,
  note: z.string().max(500).optional(),
});

export const parentMoodLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string(),
  score: parentMoodScoreSchema,
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ParentMoodScore = z.infer<typeof parentMoodScoreSchema>;
export type UpsertParentMood = z.infer<typeof upsertParentMoodSchema>;
export type ParentMoodLog = z.infer<typeof parentMoodLogSchema>;
