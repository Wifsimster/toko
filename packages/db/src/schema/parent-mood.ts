import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./users";

// Parent's own daily mood check-in. Lives at the user/account level,
// NOT per child — a parent of three kids has one mood, not three.
// One row per user per day; upsert on conflict over (user_id, date)
// so re-tapping later in the day overwrites the morning value.
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
