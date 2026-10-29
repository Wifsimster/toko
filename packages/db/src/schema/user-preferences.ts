import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./users";

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("Europe/Paris"),
  dailyReminderOptIn: boolean("daily_reminder_opt_in").notNull().default(false),
  weeklyDigestOptIn: boolean("weekly_digest_opt_in").notNull().default(false),
  coParentActivityOptIn: boolean("co_parent_activity_opt_in")
    .notNull()
    .default(false),
  morningReminderTime: text("morning_reminder_time").notNull().default("09:00"),
  eveningReminderOptIn: boolean("evening_reminder_opt_in")
    .notNull()
    .default(false),
  eveningReminderTime: text("evening_reminder_time").notNull().default("20:30"),
  lastDailyReminderAt: timestamp("last_daily_reminder_at"),
  lastWeeklyDigestAt: timestamp("last_weekly_digest_at"),
  lastEveningReminderAt: timestamp("last_evening_reminder_at"),
  formationReminderOptIn: boolean("formation_reminder_opt_in")
    .notNull()
    .default(true),
  lastFormationReminderAt: timestamp("last_formation_reminder_at"),
  formationReminderCount: integer("formation_reminder_count").notNull().default(0),
  lockPinHash: text("lock_pin_hash"),
  lockPinSalt: text("lock_pin_salt"),
  mobileTabs: text("mobile_tabs").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
