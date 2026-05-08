import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { children } from "./children";
import { user } from "./users";

export const childAccess = pgTable("child_access", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "co_parent"] })
    .notNull()
    .default("co_parent"),
  grantedBy: text("granted_by").references(() => user.id, {
    onDelete: "set null",
  }),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("child_access_child_user_unique").on(t.childId, t.userId),
  index("child_access_user_id_idx").on(t.userId),
  index("child_access_child_id_idx").on(t.childId),
]);
