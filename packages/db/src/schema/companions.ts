import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { children } from "./children";

// One row per animal a child has met via the visual timer. The companion
// reward is earned by a specific child completing their own timer, so the
// collection is scoped by `childId` — siblings keep separate collections.
// The unique (childId, animalId) index makes recording a discovery idempotent:
// meeting the same animal again is a no-op, never a duplicate row.
export const companionDiscoveries = pgTable(
  "companion_discoveries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    animalId: text("animal_id").notNull(),
    discoveredAt: timestamp("discovered_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("companion_discoveries_child_animal_idx").on(
      t.childId,
      t.animalId,
    ),
  ],
);
