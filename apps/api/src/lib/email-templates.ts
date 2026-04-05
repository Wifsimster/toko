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
  streak: number;
  topTags: string[];
  bestDay: string | null;
  hardestDay: string | null;
  featuredArticle?: { slug: string; title: string };
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

  const streakLine = data.streak > 0 ? `<strong>${data.streak} jour${data.streak > 1 ? "s" : ""}</strong>` : "—";

  const topTagsLine = data.topTags.length > 0
    ? `<strong>${data.topTags.map(escapeHtml).join(", ")}</strong>`
    : "—";

  function formatFrenchDate(dateStr: string): string {
    try {
      return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  const bestDayLine = data.bestDay ? `<strong>${formatFrenchDate(data.bestDay)}</strong>` : "—";
  const hardestDayLine = data.hardestDay ? `<strong>${formatFrenchDate(data.hardestDay)}</strong>` : "—";

  const articleBlock = data.featuredArticle
    ? `
      <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px;" />
      <p style="color: #78716c; font-size: 13px; margin: 0 0 6px;">
        Lecture suggérée cette semaine
      </p>
      <p style="margin: 0 0 12px;">
        <a href="${env.APP_URL}/ressources/${data.featuredArticle.slug}" style="color: #7c6a58; text-decoration: none; font-weight: 500;">
          ${escapeHtml(data.featuredArticle.title)} →
        </a>
      </p>
    `
    : "";

  return {
    subject: `Tokō — Bilan de la semaine pour ${data.childName}`,
    html: layout(`
      <p style="color: #44403c; font-size: 16px;">Bonjour ${escapeHtml(data.parentName)},</p>
      <p style="color: #57534e;">
        Voici un résumé rapide de la semaine pour
        <strong>${escapeHtml(data.childName)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #78716c;">Série en cours</td><td style="padding: 8px 0; text-align: right;">${streakLine}</td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Constance</td><td style="padding: 8px 0; text-align: right;">${consistencyLine}</td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Tendance humeur</td><td style="padding: 8px 0; text-align: right;"><strong>${trendLabel}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Relevés enregistrés</td><td style="padding: 8px 0; text-align: right;"><strong>${data.entriesLogged}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Étoiles Barkley</td><td style="padding: 8px 0; text-align: right;"><strong>${data.weeklyStars}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Tags fréquents</td><td style="padding: 8px 0; text-align: right;">${topTagsLine}</td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Meilleur jour</td><td style="padding: 8px 0; text-align: right;">${bestDayLine}</td></tr>
        <tr><td style="padding: 8px 0; color: #78716c;">Jour le plus difficile</td><td style="padding: 8px 0; text-align: right;">${hardestDayLine}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${env.APP_URL}/report" style="display: inline-block; background: #7c6a58; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
          Voir le bilan consultation
        </a>
      </p>
      ${articleBlock}
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
