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
  sortOrder: integer("sort_order").notNull().default(0),
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
