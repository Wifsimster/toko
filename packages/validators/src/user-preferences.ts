import { z } from "zod";
import { mobileTabsSchema } from "./mobile-tabs";

const timeHhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format invalide (HH:mm)");

export const userPreferencesSchema = z.object({
  timezone: z.string().min(1).max(100),
  dailyReminderOptIn: z.boolean(),
  weeklyDigestOptIn: z.boolean(),
  coParentActivityOptIn: z.boolean(),
  morningReminderTime: timeHhmm,
  eveningReminderOptIn: z.boolean(),
  eveningReminderTime: timeHhmm,
  formationReminderOptIn: z.boolean(),
  mobileTabs: mobileTabsSchema.nullable(),
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

export const lockPinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "Le PIN doit comporter 4 à 6 chiffres");

export const setLockPinSchema = z.object({ pin: lockPinSchema });
export const verifyLockPinSchema = z.object({ pin: lockPinSchema });

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
