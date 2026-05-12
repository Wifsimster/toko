import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";

// Analytics ingestion table (issue #219). Events can fire before signup
// completes (parentId nullable) and must survive account deletion for
// aggregate stats (ON DELETE SET NULL rather than CASCADE).
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable: pre-signup events have no parent yet; account deletion
    // preserves rows for aggregate analytics (SET NULL, not CASCADE).
    // text type matches user.id which is text (Better Auth convention).
    parentId: text("parent_id").references(() => user.id, {
      onDelete: "set null",
    }),
    eventName: text("event_name").notNull(),
    properties: jsonb("properties").notNull().default({}),
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("events_event_name_created_at_idx").on(t.eventName, t.createdAt),
    index("events_parent_id_idx").on(t.parentId),
  ]
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
