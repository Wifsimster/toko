import { journalEntries } from "@focusflow/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@focusflow/validators";
import { createChildTimelineRoutes } from "../lib/http/child-timeline-routes";
import { formatFrDate } from "../lib/format/date-fr";

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
