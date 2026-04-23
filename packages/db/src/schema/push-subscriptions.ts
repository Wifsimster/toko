import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";

// Business rule B4: Web Push endpoint storage.
// One row per (userId, endpoint). The endpoint URL from the PushManager
// is the identity — multiple devices register multiple rows. Cleared on
// user deletion via FK cascade (F3 compliant).
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    authKey: text("auth_key").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("push_subscriptions_user_endpoint_unique").on(t.userId, t.endpoint),
    index("push_subscriptions_user_id_idx").on(t.userId),
  ]
);
