import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./users";
import { children } from "./children";
import { encryptedText } from "../lib/encrypted-text";

// Append-only ledger of who-did-what against a child. Surfaces in the
// "Activité récente" tab so co-parents stay in the loop on each other's
// edits — the durable answer to "did Sophie note last night's crisis?".
//
// summary is encrypted at rest because it can contain personal details
// (e.g. "Crise notée le 4 mars" or "Médicament Concerta noté"). actor_id
// is text (not FK) so deleting a user does not nuke the household's
// activity record — we want the row to outlive the actor.
export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").references(() => user.id, {
    onDelete: "set null",
  }),
  // Free-form snapshot of the actor's display name at write time, so the
  // feed remains readable even if the user record is later deleted.
  actorName: text("actor_name"),
  childId: text("child_id").references(() => children.id, {
    onDelete: "cascade",
  }),
  entityType: text("entity_type", {
    enum: [
      "child",
      "symptom",
      "journal",
      "medication",
      "medication_log",
      "crisis_item",
      "child_access",
      "child_invitation",
      "strength",
      "routine",
      "routine_completion",
      "admin_document",
    ],
  }).notNull(),
  entityId: text("entity_id"),
  action: text("action", {
    enum: ["create", "update", "delete", "accept", "revoke", "cancel"],
  }).notNull(),
  summary: encryptedText("summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  // Recent-activity feed query: per-child reverse-chronological.
  index("audit_log_child_created_idx").on(t.childId, t.createdAt),
  index("audit_log_actor_id_idx").on(t.actorId),
]);
