import { z } from "zod";

export const solidarityRequestInputSchema = z.object({
  message: z.string().trim().max(500, "Le message ne doit pas dépasser 500 caractères").optional(),
});

export const solidarityRequestSchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid(),
  message: z.string().nullable(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
});

export type SolidarityRequestInput = z.infer<typeof solidarityRequestInputSchema>;
export type SolidarityRequest = z.infer<typeof solidarityRequestSchema>;
