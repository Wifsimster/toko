import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const articleReads = pgTable(
  "article_reads",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.slug] })],
);
