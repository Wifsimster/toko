import {
  pgTable,
  text,
  integer,
  boolean,
  date,
  timestamp,
  unique,
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
  (t) => [unique().on(t.childId, t.stepNumber)]
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
});

export const barkleyRewards = pgTable("barkley_rewards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  (t) => [unique().on(t.behaviorId, t.date)]
);
