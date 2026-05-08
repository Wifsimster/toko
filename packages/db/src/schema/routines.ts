import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { children } from "./children";

// Pillar 3 of the ADHD support frame: organisation quotidienne.
// A "routine" is a recurring sequence of micro-steps the child plays back at
// a given time of day (matin / midi / soir / coucher / autre). Splitting a
// routine into ordered steps is the core "fractionner les tâches" pattern —
// kids tick each step off rather than facing one big "get ready for school".
export const routines = pgTable(
  "routines",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji"),
    timeOfDay: text("time_of_day", {
      enum: ["morning", "noon", "evening", "bedtime", "anytime"],
    })
      .notNull()
      .default("morning"),
    // 0 = Monday … 6 = Sunday. Empty array means "every day".
    daysOfWeek: jsonb("days_of_week")
      .$type<number[]>()
      .notNull()
      .default([]),
    position: integer("position").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("routines_child_id_idx").on(t.childId)],
);

export const routineSteps = pgTable(
  "routine_steps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    emoji: text("emoji"),
    // Optional time-box, in minutes. ADHD-friendly: makes the step feel finite.
    durationMinutes: integer("duration_minutes"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("routine_steps_routine_id_idx").on(t.routineId)],
);

// One row per step-completion-on-a-given-date. Per-step rather than per-routine
// because the dashboard surfaces partial progress ("3 / 5 étapes faites ce
// matin") which is the immediate-feedback signal kids need.
export const routineCompletions = pgTable(
  "routine_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    stepId: text("step_id")
      .notNull()
      .references(() => routineSteps.id, { onDelete: "cascade" }),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (t) => [
    unique("routine_completions_step_date_unique").on(t.stepId, t.date),
    index("routine_completions_child_date_idx").on(t.childId, t.date),
  ],
);
