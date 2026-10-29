import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("global"),

  appName: text("app_name").notNull().default("Tokō"),
  supportEmail: text("support_email").notNull().default("support@toko.app"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  maintenanceMessage: text("maintenance_message"),

  inAppNotificationsEnabled: boolean("in_app_notifications_enabled")
    .notNull()
    .default(true),
  pushNotificationsEnabled: boolean("push_notifications_enabled")
    .notNull()
    .default(true),
  reminderNotificationsEnabled: boolean("reminder_notifications_enabled")
    .notNull()
    .default(true),

  emailSenderName: text("email_sender_name").notNull().default("Tokō"),
  emailSenderAddress: text("email_sender_address")
    .notNull()
    .default("noreply@toko.app"),
  welcomeEmailEnabled: boolean("welcome_email_enabled")
    .notNull()
    .default(true),
  weeklyDigestEmailEnabled: boolean("weekly_digest_email_enabled")
    .notNull()
    .default(false),

  featureKoeAssistant: boolean("feature_koe_assistant").notNull().default(true),
  featureBurnoutTest: boolean("feature_burnout_test").notNull().default(true),
  featureCommunityScripts: boolean("feature_community_scripts")
    .notNull()
    .default(true),
  featureAiRecommendations: boolean("feature_ai_recommendations")
    .notNull()
    .default(true),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export type AppSettingsRow = typeof appSettings.$inferSelect;
export type NewAppSettingsRow = typeof appSettings.$inferInsert;
