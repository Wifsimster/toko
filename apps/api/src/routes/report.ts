import { Hono, type Context } from "hono";
import { z } from "zod";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { requireChildPlan } from "../middleware/require-plan";
import { sendEmail } from "../lib/email";
import { getUserTimezone } from "../lib/local-date";
import { parseBody } from "../lib/http/validate";
import { formatFrDate } from "../lib/format/date-fr";
import { REPORT_PERIODS } from "../lib/periods";
import {
  buildReportHtml,
  buildReportPdf,
  loadReportData,
  resolveDateRange,
  type ReportData,
} from "../lib/report";

/**
 * HTTP surface for the medical report. Everything below is transport:
 * authenticate, validate, resolve the range, hand off to the report
 * module, and shape the response. Aggregation lives in `lib/report/data`
 * and rendering in `lib/report/html` + `lib/report/pdf`.
 */

export const reportRoutes = new Hono<AppEnv>();

reportRoutes.use("*", authMiddleware);

// Hard per-user quota: sending reports to arbitrary recipients is an abuse
// vector (email bombing, spam through the toko.app brand, Resend cost blow-up).
reportRoutes.use(
  "/send-email",
  rateLimiter({
    namespace: "report-send-email",
    windowMs: 60 * 60_000,
    limit: 10,
    keyBy: "user",
  }),
);

const rangeShape = {
  childId: z.string().uuid(),
  period: z.enum(REPORT_PERIODS).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  questions: z.string().max(5000).optional(),
} as const;

const sendEmailSchema = z.object({
  ...rangeShape,
  recipientEmail: z.string().email(),
});

const pdfSchema = z.object(rangeShape);

type ReportRequest = z.infer<typeof pdfSchema>;

reportRoutes.post("/send-email", async (c) => {
  const user = c.get("user");
  const { recipientEmail, ...request } = await parseBody(c, sendEmailSchema);

  const prepared = await prepareReport(c, user, request);
  if ("denied" in prepared) return prepared.denied;

  const { data, range } = prepared;
  const result = await sendEmail({
    to: recipientEmail,
    subject: `Rapport TDAH — ${data.child.name} (${formatFrDate(range.sinceDate)} → ${formatFrDate(range.untilDate)})`,
    html: buildReportHtml(data),
  });

  if (!result.sent) {
    throw new AppError(
      "INTERNAL",
      result.reason === "no-api-key"
        ? "Service email non configuré"
        : `Erreur d'envoi: ${result.detail ?? "inconnue"}`,
      500,
    );
  }

  return c.json({ sent: true, id: result.id });
});

// PDF download — same auth and plan gate as /send-email but no email
// dispatch. Returns application/pdf with a filename derived from the child
// name and period. Costs little (pdfkit is pure JS); the global IP rate
// limiter on /api/* is enough — no separate per-user quota.
reportRoutes.post("/pdf", async (c) => {
  const user = c.get("user");
  const request = await parseBody(c, pdfSchema);

  const prepared = await prepareReport(c, user, request);
  if ("denied" in prepared) return prepared.denied;

  const { data, range } = prepared;
  const pdf = await buildReportPdf(data);

  const safeName = data.child.name.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `toko-rapport-${safeName}-${range.sinceDate}_${range.untilDate}.pdf`;

  // Copy into a fresh Uint8Array so the response body has a
  // typed-array-on-ArrayBuffer shape (BodyInit) instead of
  // Buffer<ArrayBufferLike>, which TS won't accept.
  const pdfBytes = new Uint8Array(pdf.byteLength);
  pdfBytes.set(pdf);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
});

type PreparedReport =
  | { data: ReportData; range: { sinceDate: string; untilDate: string } }
  | { denied: Response };

/**
 * The access + range + load sequence both endpoints share. Returns either
 * the loaded report or the response to hand back untouched.
 */
async function prepareReport(
  c: Context<AppEnv>,
  user: AppEnv["Variables"]["user"],
  request: ReportRequest,
): Promise<PreparedReport> {
  const { childId, period, from, to, questions } = request;

  await assertChildAccess(user.id, childId);
  // Paid feature, gated on the child OWNER's subscription so a co-parent can
  // generate the report when the owner has Famille.
  const denied = await requireChildPlan(c, childId);
  if (denied) return { denied };

  const range = resolveDateRange(
    { period, from, to },
    await getUserTimezone(user.id),
  );
  if ("error" in range) {
    return { denied: c.json({ error: range.error }, 422) };
  }

  const data = await loadReportData({
    childId,
    sinceDate: range.sinceDate,
    untilDate: range.untilDate,
    questions,
    parentName: user.name ?? "Parent",
  });

  return { data, range };
}
