import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";
import { children } from "./children";

// Business rule D4: every AI recommendation surfaced to the parent is
// persisted here with its model version, sanitized input payload, the
// generated suggestion and the evidence the model cited. The parent's
// reaction (accept / reject / free-text note) is recorded on the same
// row so we can audit what worked, what hurt, and reproduce a result
// if the model is rolled back.
export const aiRecommendations = pgTable(
  "ai_recommendations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Nullable so global, non-child-scoped suggestions (e.g. onboarding tips)
    // can still be tracked.
    childId: text("child_id").references(() => children.id, {
      onDelete: "cascade",
    }),
    // Free-form model identifier, e.g. "claude-opus-4-7" or
    // "claude-haiku-4-5-20251001".
    modelVersion: text("model_version").notNull(),
    // Identifier of the prompt template used (e.g. "evening-debrief-v3").
    promptTemplate: text("prompt_template").notNull(),
    // Sanitized input payload (must satisfy rule A11 — no prénom, no PII).
    inputs: jsonb("inputs").notNull(),
    // The actual suggestion text shown to the parent.
    suggestion: text("suggestion").notNull(),
    // Structured evidence: array of `{type, ref, value}` snippets the
    // model cited (symptom averages, journal tags, etc.).
    evidence: jsonb("evidence").notNull().default([]),
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    feedbackNote: text("feedback_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ai_recommendations_user_id_idx").on(t.userId)]
);
