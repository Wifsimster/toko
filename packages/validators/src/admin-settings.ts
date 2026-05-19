import { z } from "zod";

// Editable application-wide settings, mirrored from the `app_settings`
// Drizzle table. Shared by the admin Settings API route and the admin
// Settings page form. The `id`, `updatedAt` and `updatedBy` columns are
// server-managed and never part of this payload.
export const appSettingsSchema = z.object({
  // General
  appName: z.string().trim().min(1, "Le nom de l'application est requis.").max(60),
  supportEmail: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(160),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().trim().max(300).nullable(),

  // Notifications
  inAppNotificationsEnabled: z.boolean(),
  pushNotificationsEnabled: z.boolean(),
  reminderNotificationsEnabled: z.boolean(),

  // Emails
  emailSenderName: z
    .string()
    .trim()
    .min(1, "Le nom de l'expéditeur est requis.")
    .max(60),
  emailSenderAddress: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(160),
  welcomeEmailEnabled: z.boolean(),
  weeklyDigestEmailEnabled: z.boolean(),

  // Feature flags
  featureKoeAssistant: z.boolean(),
  featureBurnoutTest: z.boolean(),
  featureCommunityScripts: z.boolean(),
  featureAiRecommendations: z.boolean(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

// PATCH /api/admin/settings accepts a partial update — any subset of the
// editable fields above.
export const updateAppSettingsSchema = appSettingsSchema.partial();

export type UpdateAppSettings = z.infer<typeof updateAppSettingsSchema>;
