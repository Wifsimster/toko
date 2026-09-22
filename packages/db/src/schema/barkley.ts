import {
  pgTable,
  text,
  integer,
  boolean,
  date,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const barkleySteps = pgTable(
  "barkley_steps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.childId, t.stepNumber),
    index("barkley_steps_child_id_idx").on(t.childId),
  ]
);

export const barkleyBehaviors = pgTable("barkley_behaviors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  points: integer("points").notNull().default(1),
  icon: text("icon"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // Soft-delete marker. A behavior with logs is archived instead of deleted so
  // the stars it earned (its completed logs) stay in the child's balance.
  // Archived rows are hidden from every list and cannot be edited or logged.
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("barkley_behaviors_child_id_idx").on(t.childId)]);

export const barkleyRewards = pgTable("barkley_rewards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  starsRequired: integer("stars_required").notNull().default(0),
  claimedAt: timestamp("claimed_at"),
  timesClaimed: integer("times_claimed").notNull().default(0),
  // Cumulative stars spent on this reward, incremented by `starsRequired` at
  // claim time. The balance sums this (not starsRequired * timesClaimed) so
  // editing the price later never rewrites past spending.
  starsSpent: integer("stars_spent").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  // Soft-delete marker: a reward that was ever claimed is archived instead of
  // deleted so its spent stars stay in the balance. Hidden from all lists.
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("barkley_rewards_child_id_idx").on(t.childId)]);

export const barkleyBehaviorLogs = pgTable(
  "barkley_behavior_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    behaviorId: text("behavior_id")
      .notNull()
      .references(() => barkleyBehaviors.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    completed: boolean("completed").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.behaviorId, t.date),
    index("barkley_behavior_logs_behavior_id_idx").on(t.behaviorId),
  ]
);
