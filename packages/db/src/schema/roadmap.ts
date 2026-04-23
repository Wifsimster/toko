import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";

// Business rule H3: founding-year community votes on the roadmap.
// Admins (user.isAdmin) create items; any authenticated parent can
// upvote at most once per item. The latest vote by count drives the
// public order.
export const roadmapItems = pgTable(
  "roadmap_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["proposed", "planned", "in_progress", "shipped", "declined"],
    })
      .notNull()
      .default("proposed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("roadmap_items_status_idx").on(t.status)]
);

export const roadmapVotes = pgTable(
  "roadmap_votes",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => roadmapItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("roadmap_votes_item_user_unique").on(t.itemId, t.userId),
  ]
);
