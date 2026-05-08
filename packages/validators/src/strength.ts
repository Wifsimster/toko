import { z } from "zod";

export const strengthCategorySchema = z.enum([
  "talent",
  "achievement",
  "quality",
  "progress",
]);

export const createStrengthSchema = z.object({
  childId: z.string().uuid({ message: "L'identifiant de l'enfant est invalide" }),
  category: strengthCategorySchema,
  title: z
    .string()
    .min(1, { message: "Le titre est requis" })
    .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
  description: z
    .string()
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" })
    .optional(),
  emoji: z
    .string()
    .max(16, { message: "L'emoji ne peut pas dépasser 16 caractères" })
    .optional(),
  occurredOn: z.string().date(),
});

export const updateStrengthSchema = createStrengthSchema
  .partial()
  .omit({ childId: true });

export const strengthSchema = createStrengthSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StrengthCategory = z.infer<typeof strengthCategorySchema>;
export type CreateStrength = z.infer<typeof createStrengthSchema>;
export type UpdateStrength = z.infer<typeof updateStrengthSchema>;
export type Strength = z.infer<typeof strengthSchema>;
