import { pgTable, text, timestamp, index, integer } from "drizzle-orm/pg-core";
import { user } from "./users";

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: text("status").notNull().default("active"),
  planId: text("plan_id").notNull(),
  // Business rule C4: "founding" cohort tag locks the original price for
  // early adopters. Set once at first subscription creation, never rewritten.
  cohort: text("cohort", { enum: ["founding", "regular"] }),
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
