import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

// Application-wide settings managed from the admin console.
//
// This is a singleton table: it holds exactly one row, keyed by the fixed
// id "global". The admin Settings page reads and writes that row. The API
// creates it on first access with the column defaults below, so no seed
// migration is needed.
//
// No FK constraints: this is global configuration, not user-scoped data.
export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("global"),

  // General — app identity and a maintenance switch.
  appName: text("app_name").notNull().default("Tokō"),
  supportEmail: text("support_email").notNull().default("support@toko.app"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  maintenanceMessage: text("maintenance_message"),

  // Notifications — app-wide notification channels.
  inAppNotificationsEnabled: boolean("in_app_notifications_enabled")
    .notNull()
    .default(true),
  pushNotificationsEnabled: boolean("push_notifications_enabled")
    .notNull()
    .default(true),
  reminderNotificationsEnabled: boolean("reminder_notifications_enabled")
    .notNull()
    .default(true),

  // Emails — transactional e-mail sender identity and per-category switches.
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

  // Feature flags — global on/off switches for optional app features.
  featureKoeAssistant: boolean("feature_koe_assistant").notNull().default(true),
  featureBurnoutTest: boolean("feature_burnout_test").notNull().default(true),
  featureCommunityScripts: boolean("feature_community_scripts")
    .notNull()
    .default(true),
  featureAiRecommendations: boolean("feature_ai_recommendations")
    .notNull()
    .default(true),

  // Audit — who last saved the settings, and when.
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export type AppSettingsRow = typeof appSettings.$inferSelect;
export type NewAppSettingsRow = typeof appSettings.$inferInsert;
