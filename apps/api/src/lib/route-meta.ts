// Per-route <title>/description/Open Graph tags injected into the SPA shell.
// Facebook, WhatsApp and LinkedIn crawlers don't run JavaScript: without this,
// every shared /quiz link would preview as the Tokō landing page.

interface RouteMeta {
  title: string;
  description: string;
}

const QUIZ_DESCRIPTION =
  "Gratuit, sans inscription, rien n'est envoyé : vos réponses restent sur votre appareil.";

const ROUTE_META: Record<string, RouteMeta> = {
  "/quiz": {
    title: "Questionnaires TDAH et autisme gratuits — Repères",
    description:
      "Quelques questions pour y voir plus clair : repérage du TDAH et de l'autisme, pour vous ou votre enfant. " +
      QUIZ_DESCRIPTION,
  },
  "/quiz/tdah-adulte": {
    title: "TDAH adulte : le questionnaire de l'OMS en 2 minutes — Repères",
    description: "6 questions de l'ASRS pour savoir s'il vaut la peine d'en parler à un médecin. " + QUIZ_DESCRIPTION,
  },
  "/quiz/tdah-enfant": {
    title: "TDAH de l'enfant : le questionnaire parent SNAP-IV — Repères",
    description: "18 questions pour faire le point avant un rendez-vous avec le médecin. " + QUIZ_DESCRIPTION,
  },
  "/quiz/top-enfant": {
    title: "Colère et opposition de l'enfant (TOP) : le questionnaire parent — Repères",
    description: "8 questions du SNAP-IV pour faire le point sur l'opposition avant d'en parler au médecin. " + QUIZ_DESCRIPTION,
  },
  "/quiz/complet-enfant": {
    title: "TDAH, opposition, autisme : le parcours complet pour votre enfant — Repères",
    description: "Ces troubles se croisent souvent. 3 questionnaires à la suite, un résultat commun, en 8 minutes. " + QUIZ_DESCRIPTION,
  },
  "/quiz/complet-adulte": {
    title: "TDAH et autisme (AuDHD) : le parcours complet adulte — Repères",
    description: "Les deux se croisent souvent. 2 questionnaires à la suite, un résultat commun, en 4 minutes. " + QUIZ_DESCRIPTION,
  },
  "/quiz/autisme-adulte": {
    title: "Autisme adulte : le questionnaire AQ-10 en 2 minutes — Repères",
    description: "10 phrases pour savoir s'il vaut la peine de demander une évaluation. " + QUIZ_DESCRIPTION,
  },
  "/quiz/autisme-enfant": {
    title: "Autisme de l'enfant : le questionnaire parent AQ-10 — Repères",
    description: "10 phrases sur votre enfant de 4 à 11 ans, avant d'en parler au médecin. " + QUIZ_DESCRIPTION,
  },
};

const SITE_ORIGIN = "https://toko.battistella.ovh";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setTag(html: string, pattern: RegExp, replacement: string): string {
  return html.replace(pattern, replacement);
}

export function applyRouteMeta(html: string, pathname: string): string {
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const meta = ROUTE_META[key];
  if (!meta) return html;
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);
  const url = escapeAttr(`${SITE_ORIGIN}${key}`);
  let out = html;
  out = setTag(out, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = setTag(out, /(<meta name="description" content=")[^"]*(")/, `$1${description}$2`);
  out = setTag(out, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  out = setTag(out, /(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`);
  out = setTag(out, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  out = setTag(out, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  out = setTag(out, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);
  out = setTag(out, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  return out;
}
