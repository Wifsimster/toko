import { z } from "zod";

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

export const updateUserPremiumSchema = z.object({
  premiumGranted: z.boolean(),
});

export type UpdateUserPremium = z.infer<typeof updateUserPremiumSchema>;
