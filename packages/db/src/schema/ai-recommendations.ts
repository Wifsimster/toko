import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";
import { children } from "./children";

export const aiRecommendations = pgTable(
  "ai_recommendations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    childId: text("child_id").references(() => children.id, {
      onDelete: "cascade",
    }),
    modelVersion: text("model_version").notNull(),
    promptTemplate: text("prompt_template").notNull(),
    inputs: jsonb("inputs").notNull(),
    suggestion: text("suggestion").notNull(),
    evidence: jsonb("evidence").notNull().default([]),
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    feedbackNote: text("feedback_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ai_recommendations_user_id_idx").on(t.userId)]
);
