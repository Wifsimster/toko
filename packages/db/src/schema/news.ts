import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./users";

export const news = pgTable(
  "news",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    // Nullable + SET NULL: deleting an admin account must not delete the
    // articles they wrote; they simply lose their author.
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("news_published_at_idx").on(t.publishedAt),
    index("news_slug_idx").on(t.slug),
  ]
);
