import { journalEntries } from "@focusflow/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@focusflow/validators";
import { createChildTimelineRoutes } from "../lib/http/child-timeline-routes";
import { formatFrDate } from "../lib/format/date-fr";

/**
 * Free-text journal entries. Same shared timeline resource as symptoms —
 * the two used to be identical files with different nouns.
 */
export const journalRoutes = createChildTimelineRoutes({
  table: journalEntries,
  entityType: "journal",
  notFoundMessage: "Entrée non trouvée",
  createSchema: createJournalEntrySchema,
  updateSchema: updateJournalEntrySchema,
  summaries: {
    create: (row) => {
      const date = formatFrDate(row.date);
      return date ? `Journal du ${date} ajouté` : "Entrée du journal ajoutée";
    },
    update: () => "Entrée du journal modifiée",
    delete: () => "Entrée du journal supprimée",
  },
});
