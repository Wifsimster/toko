import {
  pgTable,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const npsResponses = pgTable(
  "nps_responses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cohort: text("cohort", { enum: ["d30", "d90", "d365"] }).notNull(),
    score: integer("score"),
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("nps_responses_user_cohort_unique").on(t.userId, t.cohort)]
);
