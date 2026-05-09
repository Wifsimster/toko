import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, lte, asc, inArray } from "drizzle-orm";
import {
    db,
    children,
    symptoms,
    journalEntries,
    barkleySteps,
    crisisItems,
    subscription,
    medications,
    medicationLogs,
    carePathwayProgress,
} from "@focusflow/db";
import PDFDocument from "pdfkit";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess, getChildOwnerId } from "../lib/child-access";
import { sendEmail } from "../lib/email";
import { z } from "zod";

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

const PERIOD_DAYS: Record<string, number> = {
    week: 7,
    month: 30,
    quarter: 90,
};

const rangeShape = {
    childId: z.string().uuid(),
    period: z.enum(["week", "month", "quarter"]).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    questions: z.string().max(5000).optional(),
} as const;

const sendEmailSchema = z.object({
    ...rangeShape,
    recipientEmail: z.string().email(),
});

const pdfSchema = z.object(rangeShape);

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

    await assertChildAccess(user.id, childId);
    await assertOwnerHasFamillePlan(childId);

    const range = resolveDateRange({ period, from, to });
    if ("error" in range) {
        return c.json({ error: range.error }, 422);
    }

    const data = await loadReportData({
        childId,
        sinceDate: range.sinceDate,
        untilDate: range.untilDate,
        questions,
        parentName: user.name ?? "Parent",
    });

    const html = buildReportHtml(data);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const result = await sendEmail({
        to: recipientEmail,
        subject: `Rapport TDAH — ${data.child.name} (${formatDate(range.sinceDate)} → ${formatDate(range.untilDate)})`,
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

// PDF download — same auth and plan gate as /send-email but no email
// dispatch. Returns application/pdf with a filename derived from the child
// name and period. Costs little (pdfkit is pure JS); the global IP rate
// limiter on /api/* is enough — no separate per-user quota.
reportRoutes.post("/pdf", async (c) => {
    const user = c.get("user");
    const body = await c.req.json();
    const parsed = pdfSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            { error: "Données invalides", details: parsed.error.flatten() },
            422
        );
    }

    const { childId, period, from, to, questions } = parsed.data;

    await assertChildAccess(user.id, childId);
    await assertOwnerHasFamillePlan(childId);

    const range = resolveDateRange({ period, from, to });
    if ("error" in range) {
        return c.json({ error: range.error }, 422);
    }

    const data = await loadReportData({
        childId,
        sinceDate: range.sinceDate,
        untilDate: range.untilDate,
        questions,
        parentName: user.name ?? "Parent",
    });

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

// ─── Shared helpers ───────────────────────────────────────

async function assertOwnerHasFamillePlan(childId: string): Promise<void> {
    // Child-context plan check: paid features are gated on the *owner's*
    // subscription, so a co-parent can use them when the owner has Famille.
    const ownerId = await getChildOwnerId(childId);
    if (!ownerId) {
        throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
    }
    const [ownerSub] = await db
        .select({ status: subscription.status })
        .from(subscription)
        .where(eq(subscription.userId, ownerId))
        .limit(1);
    const active =
        ownerSub?.status === "active" || ownerSub?.status === "trialing";
    if (!active) {
        throw new AppError(
            "PLAN_REQUIRED",
            "Fonctionnalité réservée au plan Famille",
            403
        );
    }
}

type ResolvedRange =
    | { sinceDate: string; untilDate: string }
    | { error: string };

function resolveDateRange(input: {
    period?: "week" | "month" | "quarter";
    from?: string;
    to?: string;
}): ResolvedRange {
    if (input.from) {
        const sinceDate = input.from;
        const untilDate = input.to ?? new Date().toISOString().split("T")[0]!;
        if (sinceDate > untilDate) {
            return { error: "La date de début doit précéder la date de fin." };
        }
        return { sinceDate, untilDate };
    }
    const days = PERIOD_DAYS[input.period ?? "quarter"] ?? 90;
    return {
        sinceDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]!,
        untilDate: new Date().toISOString().split("T")[0]!,
    };
}

interface LoadReportDataInput {
    childId: string;
    sinceDate: string;
    untilDate: string;
    questions?: string;
    parentName: string;
}

async function loadReportData(input: LoadReportDataInput): Promise<ReportData> {
    const { childId, sinceDate, untilDate, questions, parentName } = input;

    const [child] = await db
        .select()
        .from(children)
        .where(eq(children.id, childId));

    if (!child) {
        throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
    }

    const [
        periodSymptoms,
        periodJournal,
        steps,
        crisis,
        meds,
        pathway,
    ] = await Promise.all([
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
        db
            .select()
            .from(medications)
            .where(eq(medications.childId, childId))
            .orderBy(asc(medications.startDate)),
        db
            .select()
            .from(carePathwayProgress)
            .where(eq(carePathwayProgress.childId, childId)),
    ]);

    // Adherence per medication on the period (taken vs scheduled days), so
    // the doctor sees observance at a glance without sifting through logs.
    const medIds = meds.map((m) => m.id);
    const logsByMed = new Map<string, { taken: number; total: number }>();
    if (medIds.length > 0) {
        const logs = await db
            .select()
            .from(medicationLogs)
            .where(
                and(
                    inArray(medicationLogs.medicationId, medIds),
                    gte(medicationLogs.date, sinceDate),
                    lte(medicationLogs.date, untilDate)
                )
            );
        for (const log of logs) {
            const cur = logsByMed.get(log.medicationId) ?? { taken: 0, total: 0 };
            cur.total += 1;
            if (log.taken) cur.taken += 1;
            logsByMed.set(log.medicationId, cur);
        }
    }

    return {
        child,
        sinceDate,
        untilDate,
        symptoms: periodSymptoms,
        journal: periodJournal,
        barkleySteps: steps,
        crisisItems: crisis,
        medications: meds.map((m) => ({
            name: m.name,
            dose: m.dose,
            schedule: m.schedule,
            startDate: m.startDate,
            endDate: m.endDate,
            notes: m.notes,
            active: m.active,
            adherence: logsByMed.get(m.id) ?? null,
        })),
        carePathway: pathway.map((p) => ({
            stepId: p.stepId,
            status: p.status,
            notes: p.notes,
            completedAt: p.completedAt,
        })),
        questions,
        parentName,
    };
}

// ─── Report data shape ────────────────────────────────────

interface ReportData {
    child: { name: string; gender: string | null; ageRange: string | null };
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
    medications: Array<{
        name: string;
        dose: string | null;
        schedule: "morning" | "noon" | "evening" | "bedtime" | "custom";
        startDate: string;
        endDate: string | null;
        notes: string | null;
        active: boolean;
        adherence: { taken: number; total: number } | null;
    }>;
    carePathway: Array<{
        stepId: string;
        status: "todo" | "doing" | "done";
        notes: string | null;
        completedAt: Date | null;
    }>;
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

const SCHEDULE_LABELS: Record<string, string> = {
    morning: "Matin",
    noon: "Midi",
    evening: "Soir",
    bedtime: "Coucher",
    custom: "Personnalisé",
};

// Mirrors the FR i18n bundle (apps/web/.../locales/fr.json :: carePathway.steps).
// Kept in sync manually — step ids are stable per care-pathway-data.ts.
const CARE_PATHWAY_LABELS: Record<string, string> = {
    school_signal: "Repérage par l'école",
    gp_consultation: "Consultation chez le médecin traitant ou pédiatre",
    ent_audition: "Bilan ORL & test auditif",
    ophtalmo_vision: "Bilan ophtalmologique",
    sleep_study: "Étude du sommeil (si suspicion)",
    speech_therapy_assessment: "Bilan orthophonique",
    psychomotor_assessment: "Bilan psychomoteur",
    neuropsy_assessment: "Bilan neuropsychologique",
    specialist_consultation: "Consultation neuropédiatre ou pédopsychiatre",
    diagnosis_announcement: "Annonce du diagnostic",
    second_opinion: "Second avis (si besoin)",
    mdph_application: "Dépôt du dossier MDPH",
    aeeh_request: "Demande AEEH",
    pch_request: "PCH (si éligible)",
    school_pap_pps: "PAP ou PPS à l'école",
    occupational_therapy: "Suivi pluridisciplinaire",
    ongoing_followup: "Suivi médical régulier",
};

const STATUS_LABELS: Record<string, string> = {
    todo: "À faire",
    doing: "En cours",
    done: "Terminé",
};

function avg(values: number[]): string {
    if (values.length === 0) return "—";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

function formatDateFr(d: string | Date): string {
    return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ─── HTML builder ─────────────────────────────────────────

function buildReportHtml(data: ReportData): string {
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
          <div style="font-size:12px;color:#6b7280">${formatDateFr(e.date)}</div>
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
           ${completedSteps.map((s) => `<li style="padding:2px 0;font-size:13px">✓ Étape ${s.stepNumber}${s.completedAt ? ` — ${formatDateFr(s.completedAt)}` : ""}</li>`).join("")}
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

    // Medications — split active from inactive so the doctor sees the
    // current treatment first and the history second.
    const activeMeds = data.medications.filter((m) => m.active);
    const inactiveMeds = data.medications.filter((m) => !m.active);

    const renderMed = (m: ReportData["medications"][number]) => {
        const period = m.endDate
            ? `${formatDateFr(m.startDate)} → ${formatDateFr(m.endDate)}`
            : `Depuis le ${formatDateFr(m.startDate)}`;
        const adherence = m.adherence && m.adherence.total > 0
            ? `<span style="margin-left:8px;font-size:12px;color:#059669">Observance ${Math.round((m.adherence.taken / m.adherence.total) * 100)}% (${m.adherence.taken}/${m.adherence.total})</span>`
            : "";
        return `<li style="padding:6px 0;border-bottom:1px solid #f3f4f6">
          <div style="font-size:14px;font-weight:500">${escapeHtml(m.name)}${m.dose ? ` <span style="color:#6b7280;font-weight:400">— ${escapeHtml(m.dose)}</span>` : ""}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px">${SCHEDULE_LABELS[m.schedule] ?? m.schedule} · ${period}${adherence}</div>
          ${m.notes ? `<div style="font-size:12px;color:#4b5563;margin-top:4px;font-style:italic">${escapeHtml(m.notes)}</div>` : ""}
        </li>`;
    };

    const medicationsSection = data.medications.length > 0
        ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Traitements médicamenteux</h3>
         ${activeMeds.length > 0 ? `<p style="font-size:12px;color:#059669;margin:4px 0 8px">En cours · ${activeMeds.length}</p><ul style="margin:0;padding-left:0;list-style:none">${activeMeds.map(renderMed).join("")}</ul>` : ""}
         ${inactiveMeds.length > 0 ? `<p style="font-size:12px;color:#6b7280;margin:12px 0 8px">Historique · ${inactiveMeds.length}</p><ul style="margin:0;padding-left:0;list-style:none;opacity:0.75">${inactiveMeds.map(renderMed).join("")}</ul>` : ""}`
        : "";

    // Care pathway — only show steps the parent has touched (status != todo
    // by virtue of having a row).
    const pathwayDone = data.carePathway.filter((p) => p.status === "done");
    const pathwayDoing = data.carePathway.filter((p) => p.status === "doing");
    const renderPathway = (p: ReportData["carePathway"][number]) => {
        const label = CARE_PATHWAY_LABELS[p.stepId] ?? p.stepId;
        const date = p.completedAt ? ` — ${formatDateFr(p.completedAt)}` : "";
        return `<li style="padding:4px 0;font-size:13px">
          <span style="font-weight:500">${escapeHtml(label)}</span>
          <span style="color:#6b7280">${date}</span>
          ${p.notes ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;font-style:italic">${escapeHtml(p.notes)}</div>` : ""}
        </li>`;
    };

    const carePathwaySection = (pathwayDone.length > 0 || pathwayDoing.length > 0)
        ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Parcours de soins</h3>
         ${pathwayDone.length > 0 ? `<p style="font-size:12px;color:#059669;margin:4px 0 4px">Étapes franchies · ${pathwayDone.length}</p><ul style="margin:0 0 8px;padding-left:20px">${pathwayDone.map(renderPathway).join("")}</ul>` : ""}
         ${pathwayDoing.length > 0 ? `<p style="font-size:12px;color:#2563eb;margin:8px 0 4px">En cours · ${pathwayDoing.length}</p><ul style="margin:0;padding-left:20px">${pathwayDoing.map(renderPathway).join("")}</ul>` : ""}`
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
    <p style="font-size:13px;color:#6b7280;margin:0">Période : ${formatDateFr(data.sinceDate)} → ${formatDateFr(data.untilDate)} · Généré le ${formatDateFr(new Date().toISOString())}</p>
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

  ${medicationsSection}
  ${carePathwaySection}

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

// ─── PDF builder ──────────────────────────────────────────

// Layout constants — shared so sections stay aligned without re-reading the
// PDFKit cursor on every block.
const PDF_PAGE_MARGIN = 50;
const PDF_BRAND = "#6366f1";
const PDF_TEXT = "#1f2937";
const PDF_MUTED = "#6b7280";
const PDF_BORDER = "#e5e7eb";

function buildReportPdf(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: PDF_PAGE_MARGIN,
            info: {
                Title: `Rapport TDAH — ${data.child.name}`,
                Author: data.parentName,
                Creator: "Tokō",
                Producer: "Tokō",
                Subject: `Période ${data.sinceDate} → ${data.untilDate}`,
            },
        });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        renderHeader(doc, data);
        if (data.questions && data.questions.trim()) {
            renderQuestionsBox(doc, data.questions.trim());
        }
        renderSynthesis(doc, data);
        renderSymptomTable(doc, data);
        renderMedications(doc, data);
        renderCarePathway(doc, data);
        renderJournalHighlights(doc, data);
        renderBarkley(doc, data);
        renderCrisisList(doc, data);
        renderFooterOnEachPage(doc, data);

        doc.end();
    });
}

type PDFDoc = InstanceType<typeof PDFDocument>;

function pageWidth(doc: PDFDoc): number {
    return doc.page.width - PDF_PAGE_MARGIN * 2;
}

function sectionTitle(doc: PDFDoc, title: string): void {
    doc.moveDown(0.6);
    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(PDF_MUTED)
        .text(title.toUpperCase(), { characterSpacing: 0.5 });
    doc.moveDown(0.3);
}

function renderHeader(doc: PDFDoc, data: ReportData): void {
    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(PDF_BRAND)
        .text("RAPPORT TDAH · TOKO", { characterSpacing: 1 });

    doc.moveDown(0.3);
    doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(PDF_TEXT)
        .text(data.child.name);

    const meta: string[] = [];
    if (data.child.gender) {
        meta.push(
            data.child.gender === "male"
                ? "Garçon"
                : data.child.gender === "female"
                    ? "Fille"
                    : data.child.gender,
        );
    }
    if (data.child.ageRange) meta.push(data.child.ageRange);

    doc.moveDown(0.2);
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(PDF_MUTED)
        .text(
            `Période : ${formatDateFr(data.sinceDate)} → ${formatDateFr(data.untilDate)} · Généré le ${formatDateFr(new Date().toISOString())}`,
        );
    if (meta.length > 0) {
        doc.text(meta.join(" · "));
    }

    doc.moveDown(0.4);
    const y = doc.y;
    doc
        .strokeColor(PDF_BRAND)
        .lineWidth(1.5)
        .moveTo(PDF_PAGE_MARGIN, y)
        .lineTo(PDF_PAGE_MARGIN + pageWidth(doc), y)
        .stroke();
    doc.moveDown(0.5);
}

function renderQuestionsBox(doc: PDFDoc, questions: string): void {
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const padding = 10;

    // Pre-measure height so we can draw a background that fits the text.
    doc.font("Helvetica").fontSize(10).fillColor(PDF_TEXT);
    const textHeight = doc.heightOfString(questions, { width: w - padding * 2 });
    const titleHeight = 14;
    const totalHeight = textHeight + titleHeight + padding * 2;

    const y = doc.y;
    doc
        .save()
        .roundedRect(x, y, w, totalHeight, 6)
        .fillColor("#eff6ff")
        .fill()
        .restore();
    doc
        .save()
        .roundedRect(x, y, w, totalHeight, 6)
        .strokeColor("#bfdbfe")
        .lineWidth(1)
        .stroke()
        .restore();

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#2563eb")
        .text("QUESTIONS DU PARENT", x + padding, y + padding, {
            characterSpacing: 0.5,
        });
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(PDF_TEXT)
        .text(questions, x + padding, y + padding + titleHeight, {
            width: w - padding * 2,
        });

    doc.y = y + totalHeight;
    doc.x = x;
    doc.moveDown(0.5);
}

function renderSynthesis(doc: PDFDoc, data: ReportData): void {
    sectionTitle(doc, "Synthèse de la période");

    const crisisCount = data.journal.filter(
        (e) => Array.isArray(e.tags) && (e.tags as string[]).includes("crisis"),
    ).length;
    const activeMedsCount = data.medications.filter((m) => m.active).length;

    const cards = [
        { value: String(data.journal.length), label: "Entrées journal" },
        { value: String(data.symptoms.length), label: "Jours suivis" },
        { value: String(crisisCount), label: "Crises notées" },
        { value: String(activeMedsCount), label: "Traitements actifs" },
    ];

    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const gap = 8;
    const cardW = (w - gap * (cards.length - 1)) / cards.length;
    const cardH = 50;
    const y = doc.y;

    cards.forEach((card, i) => {
        const cx = x + i * (cardW + gap);
        doc
            .save()
            .roundedRect(cx, y, cardW, cardH, 6)
            .strokeColor(PDF_BORDER)
            .lineWidth(1)
            .stroke()
            .restore();
        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .fillColor(PDF_TEXT)
            .text(card.value, cx, y + 8, { width: cardW, align: "center" });
        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(PDF_MUTED)
            .text(card.label, cx, y + 30, { width: cardW, align: "center" });
    });

    doc.y = y + cardH;
    doc.x = x;
    doc.moveDown(0.5);
}

function renderSymptomTable(doc: PDFDoc, data: ReportData): void {
    sectionTitle(doc, "Moyennes par dimension (échelle 1-5)");

    const dims = ["mood", "focus", "agitation", "impulse", "sleep"] as const;
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const colDimW = w * 0.55;
    const colAvgW = w * 0.225;
    const colCountW = w * 0.225;
    const rowH = 22;

    let y = doc.y;
    doc
        .save()
        .rect(x, y, w, rowH)
        .fillColor("#f9fafb")
        .fill()
        .restore();
    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(PDF_MUTED)
        .text("Dimension", x + 10, y + 7, { width: colDimW - 10 });
    doc.text("Moyenne", x + colDimW, y + 7, {
        width: colAvgW,
        align: "center",
    });
    doc.text("Relevés", x + colDimW + colAvgW, y + 7, {
        width: colCountW,
        align: "center",
    });
    y += rowH;

    dims.forEach((key) => {
        const values = data.symptoms
            .map((s) => s[key])
            .filter((v) => typeof v === "number" && v > 0);
        doc
            .strokeColor(PDF_BORDER)
            .lineWidth(0.5)
            .moveTo(x, y)
            .lineTo(x + w, y)
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(SYMPTOM_LABELS[key] ?? key, x + 10, y + 7, {
                width: colDimW - 10,
            });
        doc.text(avg(values), x + colDimW, y + 7, {
            width: colAvgW,
            align: "center",
        });
        doc.text(String(values.length), x + colDimW + colAvgW, y + 7, {
            width: colCountW,
            align: "center",
        });
        y += rowH;
    });

    doc
        .strokeColor(PDF_BORDER)
        .lineWidth(0.5)
        .moveTo(x, y)
        .lineTo(x + w, y)
        .stroke();

    doc.y = y;
    doc.x = x;
    doc.moveDown(0.5);
}

function renderMedications(doc: PDFDoc, data: ReportData): void {
    if (data.medications.length === 0) return;
    sectionTitle(doc, "Traitements médicamenteux");

    const active = data.medications.filter((m) => m.active);
    const inactive = data.medications.filter((m) => !m.active);

    const renderGroup = (
        label: string,
        meds: ReportData["medications"],
        labelColor: string,
    ) => {
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(labelColor)
            .text(`${label} · ${meds.length}`);
        doc.moveDown(0.2);

        meds.forEach((m) => {
            const period = m.endDate
                ? `${formatDateFr(m.startDate)} → ${formatDateFr(m.endDate)}`
                : `Depuis le ${formatDateFr(m.startDate)}`;
            const adherence =
                m.adherence && m.adherence.total > 0
                    ? `  ·  Observance ${Math.round(
                          (m.adherence.taken / m.adherence.total) * 100,
                      )}% (${m.adherence.taken}/${m.adherence.total})`
                    : "";

            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor(PDF_TEXT)
                .text(m.dose ? `${m.name} — ${m.dose}` : m.name, {
                    continued: false,
                });
            doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(PDF_MUTED)
                .text(
                    `${SCHEDULE_LABELS[m.schedule] ?? m.schedule} · ${period}${adherence}`,
                );
            if (m.notes) {
                doc
                    .font("Helvetica-Oblique")
                    .fontSize(9)
                    .fillColor("#4b5563")
                    .text(m.notes);
            }
            doc.moveDown(0.3);
        });
    };

    if (active.length > 0) renderGroup("EN COURS", active, "#059669");
    if (inactive.length > 0) {
        if (active.length > 0) doc.moveDown(0.2);
        renderGroup("HISTORIQUE", inactive, PDF_MUTED);
    }
    doc.moveDown(0.3);
}

function renderCarePathway(doc: PDFDoc, data: ReportData): void {
    const done = data.carePathway.filter((p) => p.status === "done");
    const doing = data.carePathway.filter((p) => p.status === "doing");
    if (done.length === 0 && doing.length === 0) return;

    sectionTitle(doc, "Parcours de soins");

    const renderStep = (p: ReportData["carePathway"][number]) => {
        const label = CARE_PATHWAY_LABELS[p.stepId] ?? p.stepId;
        const date = p.completedAt ? `  ·  ${formatDateFr(p.completedAt)}` : "";
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(`• ${label}${date}`, {
                indent: 0,
            });
        if (p.notes) {
            doc
                .font("Helvetica-Oblique")
                .fontSize(9)
                .fillColor("#4b5563")
                .text(p.notes, { indent: 12 });
        }
    };

    if (done.length > 0) {
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#059669")
            .text(`ÉTAPES FRANCHIES · ${done.length}`);
        doc.moveDown(0.2);
        done.forEach(renderStep);
    }
    if (doing.length > 0) {
        doc.moveDown(0.3);
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#2563eb")
            .text(`EN COURS · ${doing.length}`);
        doc.moveDown(0.2);
        doing.forEach(renderStep);
    }
    doc.moveDown(0.3);
}

function renderJournalHighlights(doc: PDFDoc, data: ReportData): void {
    if (data.journal.length === 0) return;
    sectionTitle(doc, "Moments marquants du journal");

    const recent = [...data.journal]
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 10);

    recent.forEach((entry) => {
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(PDF_MUTED)
            .text(formatDateFr(entry.date));
        if (entry.text) {
            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(PDF_TEXT)
                .text(entry.text);
        }
        doc.moveDown(0.3);
    });
}

function renderBarkley(doc: PDFDoc, data: ReportData): void {
    const completed = data.barkleySteps
        .filter((s) => s.completedAt)
        .sort((a, b) => a.stepNumber - b.stepNumber);
    if (completed.length === 0) return;

    sectionTitle(doc, "Programme Barkley");

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(PDF_TEXT)
        .text(`${completed.length} / 10 étapes complétées`);
    doc.moveDown(0.3);

    // Progress bar
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const barH = 6;
    const y = doc.y;
    doc
        .save()
        .roundedRect(x, y, w, barH, 3)
        .fillColor("#f3f4f6")
        .fill()
        .restore();
    doc
        .save()
        .roundedRect(x, y, (w * completed.length) / 10, barH, 3)
        .fillColor(PDF_BRAND)
        .fill()
        .restore();
    doc.y = y + barH + 6;
    doc.x = x;

    completed.forEach((s) => {
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(
                `✓ Étape ${s.stepNumber}${s.completedAt ? ` — ${formatDateFr(s.completedAt)}` : ""}`,
            );
    });
    doc.moveDown(0.3);
}

function renderCrisisList(doc: PDFDoc, data: ReportData): void {
    if (data.crisisItems.length === 0) return;
    sectionTitle(doc, "Liste de crise");

    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(PDF_MUTED)
        .text(
            `${data.crisisItems.length} stratégie${data.crisisItems.length > 1 ? "s" : ""} de régulation`,
        );
    doc.moveDown(0.2);

    data.crisisItems.forEach((item, i) => {
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(`${i + 1}. ${item.label}`);
    });
    doc.moveDown(0.3);
}

function renderFooterOnEachPage(doc: PDFDoc, data: ReportData): void {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const y = doc.page.height - PDF_PAGE_MARGIN + 10;
        const w = pageWidth(doc);
        doc
            .strokeColor(PDF_BORDER)
            .lineWidth(0.5)
            .moveTo(PDF_PAGE_MARGIN, y)
            .lineTo(PDF_PAGE_MARGIN + w, y)
            .stroke();
        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(PDF_MUTED)
            .text(
                `Tokō · toko.app — Rapport généré pour ${data.parentName} · Page ${i - range.start + 1}/${range.count}`,
                PDF_PAGE_MARGIN,
                y + 6,
                { width: w, align: "center" },
            );
        doc
            .fontSize(7)
            .fillColor("#9ca3af")
            .text(
                "Ce rapport est généré à partir des données saisies par le parent. Il ne constitue pas un diagnostic médical.",
                PDF_PAGE_MARGIN,
                y + 18,
                { width: w, align: "center" },
            );
    }
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
