import { pgTable, text, timestamp, date, integer, index } from "drizzle-orm/pg-core";
import { user } from "./users";

export const parentPauses = pgTable(
  "parent_pauses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    kind: text("kind").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("parent_pauses_user_date_idx").on(t.userId, t.date)],
);
