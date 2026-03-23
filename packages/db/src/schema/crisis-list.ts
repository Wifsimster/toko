import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { children } from "./children";

export const crisisItems = pgTable("crisis_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  emoji: text("emoji"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
