import { z } from "zod";

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

export const updateUserPremiumSchema = z.object({
  premiumGranted: z.boolean(),
});

export type UpdateUserPremium = z.infer<typeof updateUserPremiumSchema>;

export const updateUserBetaSchema = z.object({
  betaCohort: z.boolean(),
});

export type UpdateUserBeta = z.infer<typeof updateUserBetaSchema>;

export const blockUserSchema = z.object({
  isBlocked: z.boolean(),
  // Optional free-text note, kept for the admin's reference. Ignored
  // (cleared) when unblocking.
  reason: z.string().trim().max(500).optional(),
});

export type BlockUser = z.infer<typeof blockUserSchema>;
