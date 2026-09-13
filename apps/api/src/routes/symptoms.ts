import { symptoms } from "@focusflow/db";
import {
  createSymptomSchema,
  updateSymptomSchema,
} from "@focusflow/validators";
import { createChildTimelineRoutes } from "../lib/http/child-timeline-routes";
import { formatFrDate } from "../lib/format/date-fr";

/**
 * Daily symptom ratings. Access, history window, audit and attribution all
 * come from the shared timeline resource — only the wording is local.
 */
export const symptomsRoutes = createChildTimelineRoutes({
  table: symptoms,
  entityType: "symptom",
  notFoundMessage: "Relevé non trouvé",
  createSchema: createSymptomSchema,
  updateSchema: updateSymptomSchema,
  summaries: {
    create: (row) => {
      const date = formatFrDate(row.date);
      return date ? `Symptômes du ${date} enregistrés` : "Symptômes enregistrés";
    },
    update: (row) => {
      const date = formatFrDate(row.date);
      return date ? `Symptômes du ${date} mis à jour` : "Symptômes mis à jour";
    },
    delete: (row) => {
      const date = formatFrDate(row.date);
      return date ? `Symptômes du ${date} supprimés` : "Symptômes supprimés";
    },
  },
});
