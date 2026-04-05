import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // IANA timezone name, e.g. "Europe/Paris"
  timezone: text("timezone").notNull().default("Europe/Paris"),
  dailyReminderOptIn: boolean("daily_reminder_opt_in").notNull().default(true),
  weeklyDigestOptIn: boolean("weekly_digest_opt_in").notNull().default(true),
  // Timestamps to dedupe sends across cron invocations
  lastDailyReminderAt: timestamp("last_daily_reminder_at"),
  lastWeeklyDigestAt: timestamp("last_weekly_digest_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
