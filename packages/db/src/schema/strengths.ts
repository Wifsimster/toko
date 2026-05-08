import {
  pgTable,
  text,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { children } from "./children";

export const strengths = pgTable("strengths", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  category: text("category", {
    enum: ["talent", "achievement", "quality", "progress"],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  emoji: text("emoji"),
  occurredOn: date("occurred_on").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("strengths_child_id_occurred_on_idx").on(t.childId, t.occurredOn)]);
