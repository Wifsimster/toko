import { integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { children } from "./children";

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
    count: integer("count").notNull().default(1),
  },
  (t) => [
    uniqueIndex("companion_discoveries_child_animal_idx").on(
      t.childId,
      t.animalId,
    ),
  ],
);
