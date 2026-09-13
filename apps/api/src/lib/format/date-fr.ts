/**
 * French date formatting, shared by every surface that shows a date to a
 * parent (audit summaries, report HTML, report PDF, emails). Previously
 * copy-pasted into `routes/symptoms.ts`, `routes/journal.ts` and
 * `routes/report.ts`, which meant three places to change the day a locale
 * detail moved.
 */

const LONG_FR: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** "3 avril 2026" — empty string for a missing or unparsable value. */
export function formatFrDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", LONG_FR);
}

/** "03/04/2026" — compact form for dense tables. */
export function formatFrDateShort(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR");
}
