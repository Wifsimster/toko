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
  // Business rule E4: optional PIN (4-6 digits) required to unlock the
  // parent screen when E5 has locked it. Stored as SHA-256(salt + pin);
  // the salt is per-user random so two parents with the same PIN hash
  // to different values. Null means no PIN — unlock is a tap only.
  lockPinHash: text("lock_pin_hash"),
  lockPinSalt: text("lock_pin_salt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
