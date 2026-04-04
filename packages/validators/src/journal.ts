import { z } from "zod";

export const journalTagSchema = z.enum([
  "school",
  "victory",
  "crisis",
  "medication",
  "sleep",
  "sport",
  "therapy",
]);

export const createJournalEntrySchema = z.object({
  childId: z.string().uuid(),
  date: z.string().date(),
  text: z.string().max(5000).default(""),
  tags: z.array(journalTagSchema).default([]),
  moodRating: z.number().int().min(1).max(4),
});

export const updateJournalEntrySchema = createJournalEntrySchema
  .partial()
  .omit({ childId: true });

export const journalEntrySchema = createJournalEntrySchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type JournalTag = z.infer<typeof journalTagSchema>;
export type CreateJournalEntry = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntry = z.infer<typeof updateJournalEntrySchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
