import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // IANA timezone name, e.g. "Europe/Paris"
  timezone: text("timezone").notNull().default("Europe/Paris"),
  // Reminder/digest emails default to OFF (opt-in) rather than opt-out —
  // non-transactional mail must be actively chosen (RGPD/ePrivacy). New
  // accounts enable them from the account settings; the onboarding surfaces
  // the choice. Existing rows keep whatever value they already hold.
  dailyReminderOptIn: boolean("daily_reminder_opt_in").notNull().default(false),
  weeklyDigestOptIn: boolean("weekly_digest_opt_in").notNull().default(false),
  // Push when a co-parent acts on a shared child (logged a symptom,
  // edited the journal, etc). Default off so we don't surprise existing
  // users with a wave of notifications on first deploy; the share-access
  // dialog encourages enabling it when a second adult joins.
  coParentActivityOptIn: boolean("co_parent_activity_opt_in")
    .notNull()
    .default(false),
  // Per-user configurable reminder times in "HH:mm" format (24-hour)
  morningReminderTime: text("morning_reminder_time").notNull().default("09:00"),
  eveningReminderOptIn: boolean("evening_reminder_opt_in")
    .notNull()
    .default(false),
  eveningReminderTime: text("evening_reminder_time").notNull().default("20:30"),
  // Timestamps to dedupe sends across cron invocations
  lastDailyReminderAt: timestamp("last_daily_reminder_at"),
  lastWeeklyDigestAt: timestamp("last_weekly_digest_at"),
  lastEveningReminderAt: timestamp("last_evening_reminder_at"),
  // Business rule E4: optional PIN (4-6 digits) required to unlock the
  // parent screen when E5 has locked it. Stored as SHA-256(salt + pin);
  // the salt is per-user random so two parents with the same PIN hash
  // to different values. Null means no PIN — unlock is a tap only.
  lockPinHash: text("lock_pin_hash"),
  lockPinSalt: text("lock_pin_salt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
