import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./users";

// Qualitative feedback from closed-beta families (Phase 3). Free-text notes
// submitted from the in-app widget shown to cohort members, read from the
// admin console. Cascade-deleted with the account (Art. 17).
export const betaFeedback = pgTable(
  "beta_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("beta_feedback_created_at_idx").on(t.createdAt)],
);
