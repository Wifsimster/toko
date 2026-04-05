import {
  pgTable,
  text,
  date,
  integer,
  boolean,
  timestamp,
  index,
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
  routinesOk: boolean("routines_ok").notNull().default(true),
  context: text("context"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("symptoms_child_id_date_idx").on(t.childId, t.date)]);
