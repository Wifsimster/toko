import { z } from "zod";

export const createBetaFeedbackSchema = z.object({
  message: z.string().trim().min(1, "Votre message est vide").max(2000),
});

export type CreateBetaFeedback = z.infer<typeof createBetaFeedbackSchema>;
