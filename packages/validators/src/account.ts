import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type DeleteAccount = z.infer<typeof deleteAccountSchema>;
