import { pgTable, text, timestamp, index, integer, boolean } from "drizzle-orm/pg-core";
import { user } from "./users";

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: text("status").notNull().default("active"),
  planId: text("plan_id").notNull(),
  interval: text("interval", { enum: ["month", "year"] }),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  pausedUntil: timestamp("paused_until"),
  pauseMonthsUsed: integer("pause_months_used").notNull().default(0),
  pauseYearRef: integer("pause_year_ref"),
  trialReminderSentAt: timestamp("trial_reminder_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("subscription_user_id_idx").on(t.userId)]);
