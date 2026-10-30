import { dimensionTrend, trendDisplay } from "../report-trend";
import { formatFrDate } from "../format/date-fr";
import { escapeHtml } from "../format/escape-html";
import { crisisIconSvg } from "./crisis-icon";
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

export function buildReportHtml(data: ReportData): string {
    const dims = SYMPTOM_DIMENSIONS;

    const symptomRows = dims
        .map((key) => {
            const values = dimensionValues(data.symptoms, key);
            const trend = trendDisplay(dimensionTrend(data.symptoms, key));
            return `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #E8E0D3;font-weight:500">${SYMPTOM_LABELS[key]}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #E8E0D3;text-align:center">${avg(values)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #E8E0D3;text-align:center;color:${trend.color};font-size:13px">${trend.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #E8E0D3;text-align:center">${values.length}</td>
      </tr>`;
        })
        .join("");

    const journalEntries = data.journal
        .slice(0, 10)
        .map(
            (e) =>
                `<div style="padding:8px 12px;border-left:3px solid #E8E0D3;margin-bottom:8px">
          <div style="font-size:12px;color:#4F585E">${formatFrDate(e.date)}</div>
          ${e.text ? `<div style="margin-top:4px;font-size:14px">${escapeHtml(e.text)}</div>` : ""}
        </div>`
        )
        .join("");

    const completedSteps = data.barkleySteps
        .filter((s) => s.completedAt)
        .sort((a, b) => a.stepNumber - b.stepNumber);

    const barkleySection =
        completedSteps.length > 0
            ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Programme Barkley</h3>
         <p style="font-size:14px"><strong>${completedSteps.length}</strong> / 10 étapes complétées</p>
         <div style="margin-top:8px;height:8px;background:#E8E0D3;border-radius:4px;overflow:hidden">
           <div style="height:100%;width:${(completedSteps.length / 10) * 100}%;background:#358891;border-radius:4px"></div>
         </div>
         <ul style="margin-top:8px;padding-left:0;list-style:none">
           ${completedSteps.map((s) => `<li style="padding:2px 0;font-size:13px">• Étape ${s.stepNumber}${s.completedAt ? ` — ${formatFrDate(s.completedAt)}` : ""}</li>`).join("")}
         </ul>`
            : "";

    const crisisSection =
        data.crisisItems.length > 0
            ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Liste de crise</h3>
         <p style="font-size:12px;color:#4F585E">${data.crisisItems.length} stratégie${data.crisisItems.length > 1 ? "s" : ""} de régulation</p>
         <ol style="margin-top:8px;padding-left:20px">
           ${data.crisisItems.map((item) => `<li style="padding:2px 0;font-size:13px">${crisisIconSvg(item.emoji, 13, "#4F585E")}${escapeHtml(item.label)}</li>`).join("")}
         </ol>`
            : "";

    const activeMeds = data.medications.filter((m) => m.active);
    const inactiveMeds = data.medications.filter((m) => !m.active);

    const renderMed = (m: ReportMedication) => {
        const period = m.endDate
            ? `${formatFrDate(m.startDate)} — ${formatFrDate(m.endDate)}`
            : `Depuis le ${formatFrDate(m.startDate)}`;
        const adherence = m.adherence && m.adherence.total > 0
            ? `<span style="margin-left:8px;font-size:12px;color:#047857">Observance ${Math.round((m.adherence.taken / m.adherence.total) * 100)}% (${m.adherence.taken}/${m.adherence.total})</span>`
            : "";
        return `<li style="padding:6px 0;border-bottom:1px solid #E8E0D3">
          <div style="font-size:14px;font-weight:500">${escapeHtml(m.name)}${m.dose ? ` <span style="color:#4F585E;font-weight:400">— ${escapeHtml(m.dose)}</span>` : ""}</div>
          <div style="font-size:12px;color:#4F585E;margin-top:2px">${SCHEDULE_LABELS[m.schedule] ?? m.schedule} · ${period}${adherence}</div>
          ${m.notes ? `<div style="font-size:12px;color:#4F585E;margin-top:4px;font-style:italic">${escapeHtml(m.notes)}</div>` : ""}
        </li>`;
    };

    const medicationsSection = data.medications.length > 0
        ? `<h3 style="margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Traitements médicamenteux</h3>
         ${activeMeds.length > 0 ? `<p style="font-size:12px;color:#047857;margin:4px 0 8px">En cours · ${activeMeds.length}</p><ul style="margin:0;padding-left:0;list-style:none">${activeMeds.map(renderMed).join("")}</ul>` : ""}
         ${inactiveMeds.length > 0 ? `<p style="font-size:12px;color:#4F585E;margin:12px 0 8px">Historique · ${inactiveMeds.length}</p><ul style="margin:0;padding-left:0;list-style:none;opacity:0.75">${inactiveMeds.map(renderMed).join("")}</ul>` : ""}`
        : "";

    const crisisCount = countCrisisEntries(data.journal);

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rapport de suivi TDAH — ${escapeHtml(data.child.name)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1E2A2E">
  <div style="border-bottom:2px solid #358891;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#23676E;margin:0">Rapport de suivi TDAH · Tokō</p>
    <h1 style="font-size:24px;margin:8px 0 4px">${escapeHtml(data.child.name)}</h1>
    <p style="font-size:13px;color:#4F585E;margin:0">Période : ${formatFrDate(data.sinceDate)} → ${formatFrDate(data.untilDate)} · Généré le ${formatFrDate(new Date().toISOString())}</p>
  </div>

  ${data.questions ? `<div style="background:#FBF6EE;border:1px solid #E8E0D3;border-left:3px solid #358891;border-radius:8px;padding:12px 16px;margin-bottom:24px">
    <h3 style="font-size:13px;text-transform:uppercase;color:#23676E;margin:0 0 8px">Questions du parent</h3>
    <p style="font-size:14px;white-space:pre-line;margin:0">${escapeHtml(data.questions)}</p>
  </div>` : ""}

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Synthèse</h3>
  <div style="display:flex;gap:12px;margin-bottom:24px">
    <div style="flex:1;background:#F3ECE1;border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${data.journal.length}</div>
      <div style="font-size:11px;color:#4F585E">Entrées journal</div>
    </div>
    <div style="flex:1;background:#DCEFE8;border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${countTrackedDays(data.symptoms)}</div>
      <div style="font-size:11px;color:#4F585E">Jours suivis</div>
    </div>
    <div style="flex:1;background:#FBE1CF;border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:20px;font-weight:600">${crisisCount}</div>
      <div style="font-size:11px;color:#4F585E">Crises notées</div>
    </div>
  </div>

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Moyennes par dimension (échelle 0-10)</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#F3ECE1">
        <th style="padding:6px 12px;text-align:left;font-size:12px;color:#4F585E">Dimension</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#4F585E">Moyenne</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#4F585E">Tendance</th>
        <th style="padding:6px 12px;text-align:center;font-size:12px;color:#4F585E">Relevés</th>
      </tr>
    </thead>
    <tbody>${symptomRows}</tbody>
  </table>
  <p style="font-size:11px;color:#4F585E;margin:6px 0 0">Tendance : évolution de la 2ᵉ moitié de la période par rapport à la 1ʳᵉ (le mot indique si c'est mieux ou moins bien).</p>

  ${medicationsSection}

  ${journalEntries ? `<h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#4F585E">Moments marquants du journal</h3>${journalEntries}` : ""}

  ${barkleySection}
  ${crisisSection}

  <div style="margin-top:32px;border-top:1px solid #E8E0D3;padding-top:16px;text-align:center;font-size:11px;color:#4F585E">
    <p>Ce rapport est généré à partir des données saisies par le parent. Il ne constitue pas un diagnostic médical.</p>
    <p>Tokō · toko.app — Envoyé par ${escapeHtml(data.parentName)}</p>
  </div>
</body>
</html>`;
}
