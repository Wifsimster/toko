// Article metadata for server-side suggestion (weekly digest email).
// Full article content lives in apps/web/src/lib/resources-data.tsx — this
// file only mirrors the slug/title/trigger metadata so the API doesn't need
// to import JSX. A vitest cross-checks against the frontend to prevent drift.

export type ArticleTrigger =
  | "sleep:low"
  | "focus:low"
  | "mood:low"
  | "agitation:high"
  | "impulse:high"
  | "routines:broken"
  | "crisis:recent"
  | "mood-trend:down"
  | "consistency:low";

export type ArticleMeta = {
  slug: string;
  title: string;
  triggers: ArticleTrigger[];
};

// Ordered: first match wins for ties on the same trigger strength.
// When adding a new article, the priority list below must also be updated.
export const ARTICLE_META: ArticleMeta[] = [
  {
    slug: "troubles-sommeil-tdah-enfant",
    title: "Troubles du sommeil et TDAH",
    triggers: ["sleep:low"],
  },
  {
    slug: "crise-tdah-enfant-guide-complet",
    title: "Crise TDAH chez l'enfant : le guide complet",
    triggers: ["crisis:recent", "agitation:high", "mood:low"],
  },
  {
    slug: "dysregulation-emotionnelle-tdah",
    title: "La dysrégulation émotionnelle dans le TDAH",
    triggers: ["mood:low", "agitation:high"],
  },
  {
    slug: "hypersensibilite-sensorielle-tdah",
    title: "Hypersensibilité sensorielle et TDAH",
    triggers: ["agitation:high", "impulse:high"],
  },
  {
    slug: "fonctions-executives-tdah-enfant",
    title: "Les fonctions exécutives chez l'enfant TDAH",
    triggers: ["focus:low", "routines:broken"],
  },
  {
    slug: "co-regulation-parent-enfant-tdah",
    title: "Co-régulation parent-enfant TDAH",
    triggers: ["mood-trend:down", "consistency:low"],
  },
  {
    slug: "deconnexion-emotionnelle-tdah",
    title: "La déconnexion émotionnelle dans le TDAH",
    triggers: ["mood-trend:down", "mood:low"],
  },
];

export type WeekSignals = {
  sleepAvg: number;
  focusAvg: number;
  moodAvg: number;
  agitationAvg: number;
  impulseAvg: number;
  routinesBrokenRatio: number;
  moodTrend: "up" | "down" | "stable" | null;
  consistencyScore: number | null;
};

export function computeSignals(
  weekSymptoms: Array<{
    focus: number;
    mood: number;
    agitation: number;
    impulse: number;
    sleep: number;
    routinesOk: boolean;
  }>,
  moodTrend: "up" | "down" | "stable" | null,
  consistencyScore: number | null
): WeekSignals | null {
  const n = weekSymptoms.length;
  if (n < 3) return null;
  const avg = (k: "focus" | "mood" | "agitation" | "impulse" | "sleep") =>
    weekSymptoms.reduce((s, x) => s + x[k], 0) / n;
  const broken = weekSymptoms.filter((s) => !s.routinesOk).length;
  return {
    sleepAvg: avg("sleep"),
    focusAvg: avg("focus"),
    moodAvg: avg("mood"),
    agitationAvg: avg("agitation"),
    impulseAvg: avg("impulse"),
    routinesBrokenRatio: broken / n,
    moodTrend,
    consistencyScore,
  };
}

function signalStrengths(s: WeekSignals): Map<ArticleTrigger, number> {
  const out = new Map<ArticleTrigger, number>();
  if (s.sleepAvg <= 4) out.set("sleep:low", (5 - s.sleepAvg) / 5);
  if (s.focusAvg <= 4) out.set("focus:low", (5 - s.focusAvg) / 5);
  if (s.moodAvg <= 4) out.set("mood:low", (5 - s.moodAvg) / 5);
  if (s.agitationAvg >= 6)
    out.set("agitation:high", (s.agitationAvg - 5) / 5);
  if (s.impulseAvg >= 6) out.set("impulse:high", (s.impulseAvg - 5) / 5);
  if (s.routinesBrokenRatio >= 0.5)
    out.set("routines:broken", s.routinesBrokenRatio);
  if (s.moodTrend === "down") out.set("mood-trend:down", 0.7);
  if (s.consistencyScore !== null && s.consistencyScore < 40)
    out.set("consistency:low", (40 - s.consistencyScore) / 40);
  return out;
}

/**
 * Picks the single article best matching the week's signals, or null if no
 * article meets the threshold. Score = matched-trigger count + total strength.
 */
export function pickSuggestedArticle(
  signals: WeekSignals | null
): ArticleMeta | null {
  if (!signals) return null;
  const active = signalStrengths(signals);
  if (active.size === 0) return null;

  let best: { meta: ArticleMeta; score: number } | null = null;
  for (const meta of ARTICLE_META) {
    let matched = 0;
    let strength = 0;
    for (const trig of meta.triggers) {
      const s = active.get(trig);
      if (s !== undefined) {
        matched++;
        strength += s;
      }
    }
    if (matched === 0) continue;
    const score = matched + strength;
    if (!best || score > best.score) best = { meta, score };
  }
  return best?.meta ?? null;
}
