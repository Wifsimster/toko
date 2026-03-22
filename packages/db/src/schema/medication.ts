import {
  pgTable,
  text,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const medication = pgTable("medication", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medication.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status", {
    enum: ["taken", "skipped", "delayed"],
  }).notNull(),
  takenAt: timestamp("taken_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
