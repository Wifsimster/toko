import {
  pgTable,
  text,
  date,
  timestamp,
  json,
  index,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const journalEntries = pgTable("journal_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  text: text("text").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("journal_entries_child_id_date_idx").on(t.childId, t.date)]);
