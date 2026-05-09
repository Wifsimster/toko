import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  customType,
  index,
} from "drizzle-orm/pg-core";
import { children } from "./children";

// Postgres bytea — drizzle-pg doesn't ship a first-class bytea type yet,
// so we declare it manually. Maps to Buffer on the application side.
const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

// Sensitive medical paperwork — bilans, comptes-rendus, ordonnances,
// MDPH dossiers. Stored inline as bytea so the deployment doesn't need
// an external object store; works equally well on a self-hosted single
// container or on a managed Postgres. Cap enforced at the route layer
// (10 MB) — bytea itself can store up to ~1 GB but that's not the goal.
export const adminDocuments = pgTable(
  "admin_documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    category: text("category", {
      enum: [
        "bilan_orthophonie",
        "bilan_psychomot",
        "bilan_neuropsy",
        "compte_rendu_medical",
        "mdph",
        "ecole_pap_pps",
        "ordonnance",
        "autre",
      ],
    }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    content: bytea("content").notNull(),
    occurredOn: date("occurred_on"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("admin_documents_child_id_idx").on(t.childId),
  ],
);
