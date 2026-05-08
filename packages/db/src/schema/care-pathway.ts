import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { children } from "./children";

// One row per (child, step) only when the parent has interacted with it.
// Step ids are curated client-side strings (see apps/web/.../care-pathway-data),
// not an FK to a steps table — the catalogue is content, not data.
export const carePathwayProgress = pgTable(
  "care_pathway_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    stepId: text("step_id").notNull(),
    status: text("status", { enum: ["todo", "doing", "done"] })
      .notNull()
      .default("todo"),
    notes: text("notes"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("care_pathway_progress_child_step_idx").on(t.childId, t.stepId),
  ],
);
