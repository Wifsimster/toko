import {
  pgTable,
  text,
  date,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const medications = pgTable(
  "medications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dose: text("dose"),
    schedule: text("schedule", {
      enum: ["morning", "noon", "evening", "bedtime", "custom"],
    }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("medications_child_id_idx").on(t.childId)]
);

export const medicationLogs = pgTable(
  "medication_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    medicationId: text("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    taken: boolean("taken").notNull(),
    sideEffects: text("side_effects"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.medicationId, t.date),
    index("medication_logs_medication_id_idx").on(t.medicationId),
  ]
);
