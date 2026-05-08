import { pgTable, text, timestamp, index, integer } from "drizzle-orm/pg-core";
import { user } from "./users";

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  // Unique: one user → at most one subscription row. When a user resubscribes
  // after cancellation, the existing row is updated (conflict target = userId)
  // rather than a second row created. Prevents the "two rows, which one is
  // current?" ambiguity surfaced by stripe-integration-review #103.
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: text("status").notNull().default("active"),
  planId: text("plan_id").notNull(),
  // Stripe billing interval, mirrored from price.recurring.interval at
  // create + update time so the UI can show "Famille — mensuel" /
  // "Famille — annuel" without an extra Stripe call per pageload.
  interval: text("interval", { enum: ["month", "year"] }),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  // Business rule C3: free pause up to 3 months per calendar year. When
  // non-null, billing is paused until this timestamp. `pauseMonthsUsed` is
  // the running total for `pauseYearRef` (calendar year); we reset the
  // counter whenever a new pause crosses into a new year.
  pausedUntil: timestamp("paused_until"),
  pauseMonthsUsed: integer("pause_months_used").notNull().default(0),
  pauseYearRef: integer("pause_year_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("subscription_user_id_idx").on(t.userId)]);
