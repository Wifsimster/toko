import { dimensionTrend, trendDisplay } from "../report-trend";
import { formatFrDate } from "../format/date-fr";
import { escapeHtml } from "../format/escape-html";
import {
    avg,
    countCrisisEntries,
    countTrackedDays,
    dimensionValues,
    SCHEDULE_LABELS,
    SYMPTOM_DIMENSIONS,
    SYMPTOM_LABELS,
    type ReportData,
    type ReportMedication,
} from "./types";

/**
 * The report as an email-safe HTML document: inline styles only, no
 * external assets. It reads `ReportData` and nothing else — no database,
 * no request context — which is what makes it snapshot-testable.
 */
export function buildReportHtml(data: ReportData): string {
    const dims = SYMPTOM_DIMENSIONS;

    // Symptom averages + trend (2nd half vs 1st half of the period)
    const symptomRows = dims
        .map((key) => {
            const values = dimensionValues(data.symptoms, key);
            const trend = trendDisplay(dimensionTrend(data.symptoms, key));
            return `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:500">${SYMPTOM_LABELS[key]}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${avg(values)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;color:${trend.color};font-size:13px">${trend.label}</td>
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
          <div style="font-size:12px;color:#6b7280">${formatFrDate(e.date)}</div>
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
           ${completedSteps.map((s) => `<li style="padding:2px 0;font-size:13px">• Étape ${s.stepNumber}${s.completedAt ? ` — ${formatFrDate(s.completedAt)}` : ""}</li>`).join("")}
         </ul>`
            : "";

    // Crisis list
    const crisisSection =
        data.crisisItems.length > 0
            ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Liste de crise</h3>
         <p style="font-size:12px;color:#6b7280">${data.crisisItems.length} stratégie${data.crisisItems.length > 1 ? "s" : ""} de régulation</p>
         <ol style="margin-top:8px;padding-left:20px">
           ${data.crisisItems.map((item) => `<li style="padding:2px 0;font-size:13px">${item.emoji ? escapeHtml(item.emoji) + " " : ""}${escapeHtml(item.label)}</li>`).join("")}
         </ol>`
            : "";

    // Medications — split active from inactive so the doctor sees the
    // current treatment first and the history second.
    const activeMeds = data.medications.filter((m) => m.active);
    const inactiveMeds = data.medications.filter((m) => !m.active);

    const renderMed = (m: ReportMedication) => {
        const period = m.endDate
            ? `${formatFrDate(m.startDate)} — ${formatFrDate(m.endDate)}`
            : `Depuis le ${formatFrDate(m.startDate)}`;
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

    const crisisCount = countCrisisEntries(data.journal);

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rapport TDAH — ${escapeHtml(data.child.name)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin:0">Rapport TDAH · Tokō</p>
    <h1 style="font-size:24px;margin:8px 0 4px">${escapeHtml(data.child.name)}</h1>
    <p style="font-size:13px;color:#6b7280;margin:0">Période : ${formatFrDate(data.sinceDate)} → ${formatFrDate(data.untilDate)} · Généré le ${formatFrDate(new Date().toISOString())}</p>
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
      <div style="font-size:20px;font-weight:600">${countTrackedDays(data.symptoms)}</div>
      <div style="font-size:11px;color:#6b7280">Jours suivis</div>
    </div>
    <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${crisisCount}</div>
      <div style="font-size:11px;color:#6b7280">Crises notées</div>
    </div>
  </div>

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Moyennes par dimension (échelle 0-10)</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#f9fafb">
        <th style="padding:6px 12px;text-align:left;font-size:12px;color:#6b7280">Dimension</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">Moyenne</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">Tendance</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">Relevés</th>
      </tr>
    </thead>
    <tbody>${symptomRows}</tbody>
  </table>
  <p style="font-size:11px;color:#9ca3af;margin:6px 0 0">Tendance : évolution de la 2ᵉ moitié de la période par rapport à la 1ʳᵉ (vert = amélioration, rouge = aggravation).</p>

  ${medicationsSection}

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
