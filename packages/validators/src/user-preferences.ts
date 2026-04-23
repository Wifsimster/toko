import { z } from "zod";

export const userPreferencesSchema = z.object({
  timezone: z.string().min(1).max(100),
  dailyReminderOptIn: z.boolean(),
  weeklyDigestOptIn: z.boolean(),
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

// Business rule E4: 4–6 digit PIN, digits only.
export const lockPinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "Le PIN doit comporter 4 à 6 chiffres");

export const setLockPinSchema = z.object({ pin: lockPinSchema });
export const verifyLockPinSchema = z.object({ pin: lockPinSchema });

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
