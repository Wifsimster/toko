import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./users";
import { children } from "./children";
import { encryptedText } from "../lib/encrypted-text";

export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").references(() => user.id, {
    onDelete: "set null",
  }),
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
  index("audit_log_child_created_idx").on(t.childId, t.createdAt),
  index("audit_log_actor_id_idx").on(t.actorId),
]);
