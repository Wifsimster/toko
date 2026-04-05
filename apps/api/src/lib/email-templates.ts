import { env } from "./env";

function layout(innerHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="font-family: -apple-system, system-ui, sans-serif; background: #fafaf9; margin: 0; padding: 24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e7e5e4;">
      <tr><td>
        <div style="font-size: 20px; font-weight: 600; color: #44403c; margin-bottom: 16px;">Tokō</div>
        ${innerHtml}
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #a8a29e; margin: 0;">
          Vous recevez cet email parce que vous avez activé les rappels dans votre compte Tokō.
          <a href="${env.APP_URL}/account" style="color: #78716c;">Gérer mes notifications</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function dailyReminderTemplate(parentName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Tokō — Un petit rappel pour aujourd'hui",
    html: layout(`
      <p style="color: #44403c; font-size: 16px;">Bonjour ${escapeHtml(parentName)},</p>
      <p style="color: #57534e;">
        Rien de noté aujourd'hui pour l'instant. Un relevé rapide (30 secondes)
        permet de garder votre suivi à jour.
      </p>
      <p style="margin: 24px 0;">
        <a href="${env.APP_URL}/dashboard" style="display: inline-block; background: #7c6a58; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
          Logger une humeur
        </a>
      </p>
      <p style="color: #78716c; font-size: 14px;">
        Quatre emojis sur le dashboard, un clic, c'est tout.
      </p>
    `),
  };
}

export type WeeklyDigestData = {
  parentName: string;
  childName: string;
  consistencyScore: number | null;
  moodTrend: "up" | "down" | "stable" | null;
  entriesLogged: number;
  weeklyStars: number;
};

export function weeklyDigestTemplate(data: WeeklyDigestData): {
  subject: string;
  html: string;
} {
  const trendLabel =
    data.moodTrend === "up"
      ? "en hausse ↗︎"
      : data.moodTrend === "down"
        ? "en baisse ↘︎"
        : data.moodTrend === "stable"
          ? "stable →"
          : "—";

  const consistencyLine =
    data.consistencyScore !== null
      ? `<strong>${data.consistencyScore}/100</strong>`
      : "—";

  return {
    subject: `Tokō — Bilan de la semaine pour ${data.childName}`,
    html: layout(`
      <p style="color: #44403c; font-size: 16px;">Bonjour ${escapeHtml(data.parentName)},</p>
      <p style="color: #57534e;">
        Voici un résumé rapide de la semaine pour
        <strong>${escapeHtml(data.childName)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #78716c;">Constance</td><td style="padding: 8px 0; text-align: right;">${consistencyLine}</td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Tendance humeur</td><td style="padding: 8px 0; text-align: right;"><strong>${trendLabel}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Relevés enregistrés</td><td style="padding: 8px 0; text-align: right;"><strong>${data.entriesLogged}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Étoiles Barkley</td><td style="padding: 8px 0; text-align: right;"><strong>${data.weeklyStars}</strong></td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${env.APP_URL}/dashboard" style="display: inline-block; background: #7c6a58; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
          Voir le détail
        </a>
      </p>
    `),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
