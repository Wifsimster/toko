import { z } from "zod";

export const createCrisisItemSchema = z.object({
  childId: z.string().uuid(),
  label: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  position: z.number().int().min(0).optional(),
});

export const updateCrisisItemSchema = createCrisisItemSchema
  .partial()
  .omit({ childId: true });

export const reorderCrisisItemsSchema = z.object({
  childId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export const crisisItemSchema = createCrisisItemSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateCrisisItem = z.infer<typeof createCrisisItemSchema>;
export type UpdateCrisisItem = z.infer<typeof updateCrisisItemSchema>;
export type ReorderCrisisItems = z.infer<typeof reorderCrisisItemsSchema>;
export type CrisisItem = z.infer<typeof crisisItemSchema>;
