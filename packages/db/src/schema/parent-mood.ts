import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const parentMoodLogs = pgTable(
  "parent_mood_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    score: integer("score").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("parent_mood_logs_user_date_idx").on(t.userId, t.date)],
);
