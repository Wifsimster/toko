import {
  pgTable,
  text,
  date,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const symptoms = pgTable("symptoms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  agitation: integer("agitation").notNull(),
  focus: integer("focus").notNull(),
  impulse: integer("impulse").notNull(),
  mood: integer("mood").notNull(),
  sleep: integer("sleep").notNull(),
  social: integer("social").notNull().default(5),
  autonomy: integer("autonomy").notNull().default(5),
  context: text("context"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
