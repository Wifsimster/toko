import { z } from "zod";

export const appSettingsSchema = z.object({
  appName: z.string().trim().min(1, "Le nom de l'application est requis.").max(60),
  supportEmail: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(160),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().trim().max(300).nullable(),

  inAppNotificationsEnabled: z.boolean(),
  pushNotificationsEnabled: z.boolean(),
  reminderNotificationsEnabled: z.boolean(),

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

  featureKoeAssistant: z.boolean(),
  featureBurnoutTest: z.boolean(),
  featureCommunityScripts: z.boolean(),
  featureAiRecommendations: z.boolean(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const updateAppSettingsSchema = appSettingsSchema.partial();

export type UpdateAppSettings = z.infer<typeof updateAppSettingsSchema>;
