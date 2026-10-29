import { pgTable, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { user } from "./users";

export const consents = pgTable(
  "consents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "terms",
        "privacy",
        "ai_usage",
        "research",
        "parental_authority_attestation",
        "co_parent_health_processing",
        "owner_health_processing",
      ],
    }).notNull(),
    version: text("version").notNull(),
    grantedAt: timestamp("granted_at").notNull().defaultNow(),
    revokedAt: timestamp("revoked_at"),
  },
  (t) => [index("consents_user_type_idx").on(t.userId, t.type)]
);
