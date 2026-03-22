import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { children } from "./children";

export const appointments = pgTable("appointments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type", {
    enum: [
      "neurologist",
      "speech_therapist",
      "psychologist",
      "school_pap",
      "school_pps",
      "pediatrician",
      "other",
    ],
  }).notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
