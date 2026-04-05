import { z } from "zod";

export const userPreferencesSchema = z.object({
  timezone: z.string().min(1).max(100),
  dailyReminderOptIn: z.boolean(),
  weeklyDigestOptIn: z.boolean(),
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
