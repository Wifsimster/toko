import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
