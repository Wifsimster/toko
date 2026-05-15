import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

// Agent access keys — credentials a parent issues so their own AI assistant
// (via the Tokō MCP server) can READ their children's tracking data.
//
// Security model:
//  - The raw secret (`toko_sk_…`) is shown once at creation and never stored;
//    only its SHA-256 hash lives here. Lookup is by hash.
//  - Keys are read-only and scoped to a fixed endpoint allowlist — enforced
//    in authMiddleware, never trusted from the key itself.
//  - `revokedAt` is a soft-revoke so a leaked key can be killed instantly
//    without losing the audit trail of when it existed.
export const agentKey = pgTable("agent_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Parent-chosen label, e.g. "Mon assistant Claude".
  name: text("name").notNull(),
  // SHA-256 hex of the full secret. Unique so a hash collision can't shadow.
  keyHash: text("key_hash").notNull().unique(),
  // Human-readable, non-secret start of the key for display in the UI,
  // e.g. "toko_sk_a1b2c3d4". Never enough to reconstruct the secret.
  prefix: text("prefix").notNull(),
  // CSV of granted scopes. v1 only ever issues "read".
  scopes: text("scopes").notNull().default("read"),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
