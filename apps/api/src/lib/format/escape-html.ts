/**
 * HTML entity escaping for user-supplied text injected into a template
 * string (report HTML, transactional emails, co-parent invites).
 *
 * Three identical private copies of this function existed — in
 * `lib/co-parent-emails.ts`, `lib/email-templates.ts` and
 * `routes/report.ts`. A single exported implementation means one place to
 * audit when the escaping rules are questioned.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
