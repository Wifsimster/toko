import { pgTable, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { user } from "./users";

// Business rule F4: record explicit parental consent per sensitive feature
// and per CGU/privacy version. Latest row per (userId, type) is authoritative;
// a new grant appends a row so we keep the full audit trail.
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
      enum: ["terms", "privacy", "ai_usage", "research"],
    }).notNull(),
    // Free-form version identifier, e.g. "2026-04-23" or "v2.1". Opaque
    // from the schema's perspective — the client is responsible for
    // matching it against the currently-shown document.
    version: text("version").notNull(),
    grantedAt: timestamp("granted_at").notNull().defaultNow(),
    // When non-null, this row represents a revocation. Kept alongside the
    // original grant for auditability.
    revokedAt: timestamp("revoked_at"),
  },
  (t) => [index("consents_user_type_idx").on(t.userId, t.type)]
);
