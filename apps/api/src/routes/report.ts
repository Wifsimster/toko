import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import {
    db,
    children,
    symptoms,
    journalEntries,
    barkleySteps,
    crisisItems,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { requirePlan } from "../middleware/require-plan";
import { AppError } from "../middleware/error-handler";
import { sendEmail } from "../lib/email";
import { z } from "zod";

export const reportRoutes = new Hono<AppEnv>();

reportRoutes.use("*", authMiddleware);

// PDF report requires an active subscription
reportRoutes.use("*", requirePlan);

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

const PERIOD_DAYS: Record<string, number> = {
    week: 7,
    month: 30,
    quarter: 90,
};

const sendEmailSchema = z.object({
    childId: z.string().uuid(),
    recipientEmail: z.string().email(),
    period: z.enum(["week", "month", "quarter"]).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    questions: z.string().max(5000).optional(),
});

reportRoutes.post("/send-email", async (c) => {
    const user = c.get("user");
    const body = await c.req.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            { error: "Données invalides", details: parsed.error.flatten() },
            422
        );
    }

    const { childId, recipientEmail, period, from, to, questions } = parsed.data;

    const [child] = await db
        .select()
        .from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

    if (!child) {
        throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
    }

    // Compute date range
    let sinceDate: string;
    let untilDate: string;
    if (from) {
        sinceDate = from;
        untilDate = to ?? new Date().toISOString().split("T")[0]!;
    } else {
        const days = PERIOD_DAYS[period ?? "quarter"] ?? 90;
        sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]!;
        untilDate = new Date().toISOString().split("T")[0]!;
    }

    // Fetch data
    const [periodSymptoms, periodJournal, steps, crisis] = await Promise.all([
        db
            .select()
            .from(symptoms)
            .where(
                and(
                    eq(symptoms.childId, childId),
                    gte(symptoms.date, sinceDate),
                    lte(symptoms.date, untilDate)
                )
            )
            .orderBy(symptoms.date),
        db
            .select()
            .from(journalEntries)
            .where(
                and(
                    eq(journalEntries.childId, childId),
                    gte(journalEntries.date, sinceDate),
                    lte(journalEntries.date, untilDate)
                )
            )
            .orderBy(journalEntries.date),
        db
            .select()
            .from(barkleySteps)
            .where(eq(barkleySteps.childId, childId)),
        db
            .select()
            .from(crisisItems)
            .where(eq(crisisItems.childId, childId))
            .orderBy(asc(crisisItems.position)),
    ]);

    // Build HTML report
    const html = buildReportHtml({
        child,
        sinceDate,
        untilDate,
        symptoms: periodSymptoms,
        journal: periodJournal,
        barkleySteps: steps,
        crisisItems: crisis,
        questions,
        parentName: user.name ?? "Parent",
    });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const result = await sendEmail({
        to: recipientEmail,
        subject: `Rapport TDAH — ${child.name} (${formatDate(sinceDate)} → ${formatDate(untilDate)})`,
        html,
    });

    if (!result.sent) {
        throw new AppError(
            "INTERNAL",
            result.reason === "no-api-key"
                ? "Service email non configuré"
                : `Erreur d'envoi: ${result.detail ?? "inconnue"}`,
            500
        );
    }

    return c.json({ sent: true, id: result.id });
});

// ─── HTML builder ─────────────────────────────────────────

interface ReportData {
    child: { name: string; gender: string | null; birthDate: string | null };
    sinceDate: string;
    untilDate: string;
    symptoms: Array<{
        date: string;
        mood: number;
        focus: number;
        agitation: number;
        impulse: number;
        sleep: number;
    }>;
    journal: Array<{ date: string; text: string | null; tags: unknown }>;
    barkleySteps: Array<{ stepNumber: number; completedAt: Date | null }>;
    crisisItems: Array<{ label: string; emoji: string | null; position: number }>;
    questions?: string;
    parentName: string;
}

const SYMPTOM_LABELS: Record<string, string> = {
    mood: "Humeur",
    focus: "Concentration",
    agitation: "Agitation",
    impulse: "Impulsivité",
    sleep: "Sommeil",
};

function avg(values: number[]): string {
    if (values.length === 0) return "—";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

function buildReportHtml(data: ReportData): string {
    const formatDate = (d: string | Date) =>
        new Date(d).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const dims = ["mood", "focus", "agitation", "impulse", "sleep"] as const;

    // Symptom averages
    const symptomRows = dims
        .map((key) => {
            const values = data.symptoms
                .map((s) => s[key])
                .filter((v) => typeof v === "number" && v > 0);
            return `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:500">${SYMPTOM_LABELS[key]}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${avg(values)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${values.length}</td>
      </tr>`;
        })
        .join("");

    // Journal
    const journalEntries = data.journal
        .slice(0, 10)
        .map(
            (e) =>
                `<div style="padding:8px 12px;border-left:3px solid #e5e7eb;margin-bottom:8px">
          <div style="font-size:12px;color:#6b7280">${formatDate(e.date)}</div>
          ${e.text ? `<div style="margin-top:4px;font-size:14px">${escapeHtml(e.text)}</div>` : ""}
        </div>`
        )
        .join("");

    // Barkley
    const completedSteps = data.barkleySteps
        .filter((s) => s.completedAt)
        .sort((a, b) => a.stepNumber - b.stepNumber);

    const barkleySection =
        completedSteps.length > 0
            ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Programme Barkley</h3>
         <p style="font-size:14px"><strong>${completedSteps.length}</strong> / 10 étapes complétées</p>
         <div style="margin-top:8px;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden">
           <div style="height:100%;width:${(completedSteps.length / 10) * 100}%;background:#6366f1;border-radius:4px"></div>
         </div>
         <ul style="margin-top:8px;padding-left:0;list-style:none">
           ${completedSteps.map((s) => `<li style="padding:2px 0;font-size:13px">✓ Étape ${s.stepNumber}${s.completedAt ? ` — ${formatDate(s.completedAt)}` : ""}</li>`).join("")}
         </ul>`
            : "";

    // Crisis list
    const crisisSection =
        data.crisisItems.length > 0
            ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Liste de crise</h3>
         <p style="font-size:12px;color:#6b7280">${data.crisisItems.length} stratégie${data.crisisItems.length > 1 ? "s" : ""} de régulation</p>
         <ol style="margin-top:8px;padding-left:20px">
           ${data.crisisItems.map((item) => `<li style="padding:2px 0;font-size:13px">${item.emoji ? item.emoji + " " : ""}${escapeHtml(item.label)}</li>`).join("")}
         </ol>`
            : "";

    const crisisCount = data.journal.filter(
        (e) => Array.isArray(e.tags) && e.tags.includes("crisis")
    ).length;

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rapport TDAH — ${escapeHtml(data.child.name)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin:0">Rapport TDAH · Tokō</p>
    <h1 style="font-size:24px;margin:8px 0 4px">${escapeHtml(data.child.name)}</h1>
    <p style="font-size:13px;color:#6b7280;margin:0">Période : ${formatDate(data.sinceDate)} → ${formatDate(data.untilDate)} · Généré le ${formatDate(new Date().toISOString())}</p>
  </div>

  ${data.questions ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:24px">
    <h3 style="font-size:13px;text-transform:uppercase;color:#2563eb;margin:0 0 8px">Questions du parent</h3>
    <p style="font-size:14px;white-space:pre-line;margin:0">${escapeHtml(data.questions)}</p>
  </div>` : ""}

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Synthèse</h3>
  <div style="display:flex;gap:12px;margin-bottom:24px">
    <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${data.journal.length}</div>
      <div style="font-size:11px;color:#6b7280">Entrées journal</div>
    </div>
    <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${data.symptoms.length}</div>
      <div style="font-size:11px;color:#6b7280">Jours suivis</div>
    </div>
    <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${crisisCount}</div>
      <div style="font-size:11px;color:#6b7280">Crises notées</div>
    </div>
  </div>

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Moyennes par dimension (1-5)</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#f9fafb">
        <th style="padding:6px 12px;text-align:left;font-size:12px;color:#6b7280">Dimension</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">Moyenne</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">Relevés</th>
      </tr>
    </thead>
    <tbody>${symptomRows}</tbody>
  </table>

  ${journalEntries ? `<h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Moments marquants du journal</h3>${journalEntries}` : ""}

  ${barkleySection}
  ${crisisSection}

  <div style="margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;text-align:center;font-size:11px;color:#9ca3af">
    <p>Ce rapport est généré à partir des données saisies par le parent. Il ne constitue pas un diagnostic médical.</p>
    <p>Tokō · toko.app — Envoyé par ${escapeHtml(data.parentName)}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
