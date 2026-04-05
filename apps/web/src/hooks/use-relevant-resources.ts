import { useMemo } from "react";
import { useSymptoms } from "@/hooks/use-symptoms";
import { useStats } from "@/hooks/use-stats";
import { articles } from "@/lib/resources-data";
import type {
  ArticleTrigger,
  ResourceArticle,
} from "@/lib/resources-types";

const LOOKBACK_DAYS = 7;
const MIN_ENTRIES_FOR_TREND = 3;

type Signal = { trigger: ArticleTrigger; strength: number };

/**
 * Evaluates recent child data against heuristic thresholds and returns the
 * list of active triggers with a strength score (0..1). Callers match these
 * against each article's `triggers` array.
 */
function evaluateSignals(
  recentSymptoms: { date: string; focus: number; mood: number; agitation: number; impulse: number; sleep: number; routinesOk: boolean }[],
  consistencyScore: number | null,
  moodTrend: "up" | "down" | "stable" | null
): Signal[] {
  const signals: Signal[] = [];
  const n = recentSymptoms.length;
  if (n < MIN_ENTRIES_FOR_TREND) return signals;

  const avg = (key: "focus" | "mood" | "agitation" | "impulse" | "sleep") =>
    recentSymptoms.reduce((s, x) => s + x[key], 0) / n;

  const sleepAvg = avg("sleep");
  if (sleepAvg <= 4) signals.push({ trigger: "sleep:low", strength: (5 - sleepAvg) / 5 });

  const focusAvg = avg("focus");
  if (focusAvg <= 4) signals.push({ trigger: "focus:low", strength: (5 - focusAvg) / 5 });

  const moodAvg = avg("mood");
  if (moodAvg <= 4) signals.push({ trigger: "mood:low", strength: (5 - moodAvg) / 5 });

  const agitationAvg = avg("agitation");
  if (agitationAvg >= 6) signals.push({ trigger: "agitation:high", strength: (agitationAvg - 5) / 5 });

  const impulseAvg = avg("impulse");
  if (impulseAvg >= 6) signals.push({ trigger: "impulse:high", strength: (impulseAvg - 5) / 5 });

  const brokenRoutines = recentSymptoms.filter((s) => !s.routinesOk).length;
  if (brokenRoutines >= Math.ceil(n / 2)) {
    signals.push({ trigger: "routines:broken", strength: brokenRoutines / n });
  }

  if (moodTrend === "down") {
    signals.push({ trigger: "mood-trend:down", strength: 0.7 });
  }

  if (consistencyScore !== null && consistencyScore < 40) {
    signals.push({ trigger: "consistency:low", strength: (40 - consistencyScore) / 40 });
  }

  return signals;
}

export interface Recommendation {
  article: ResourceArticle;
  matchedTriggers: ArticleTrigger[];
  score: number;
}

/**
 * Heuristically recommends articles from the public knowledge base based on
 * the child's recent symptom data. Returns articles ranked by match score
 * (number of matched triggers × mean strength). Entourage articles and
 * articles without triggers are never recommended here.
 */
export function useRelevantResources(childId: string): Recommendation[] {
  const { data: symptoms } = useSymptoms(childId);
  const { data: stats } = useStats(childId, "week");

  return useMemo(() => {
    if (!childId || !symptoms || symptoms.length === 0) return [];

    const today = new Date();
    const cutoff = new Date(today.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]!;
    const recent = symptoms.filter((s) => s.date >= cutoff);

    const signals = evaluateSignals(
      recent,
      stats?.consistencyScore ?? null,
      stats?.moodTrend ?? null
    );
    if (signals.length === 0) return [];

    const signalByTrigger = new Map(signals.map((s) => [s.trigger, s]));

    const matches: Recommendation[] = [];
    for (const article of articles) {
      if (!article.triggers || article.triggers.length === 0) continue;
      if (article.audience === "entourage") continue;

      const matched: ArticleTrigger[] = [];
      let strengthSum = 0;
      for (const trig of article.triggers) {
        const sig = signalByTrigger.get(trig);
        if (sig) {
          matched.push(trig);
          strengthSum += sig.strength;
        }
      }
      if (matched.length === 0) continue;
      matches.push({
        article,
        matchedTriggers: matched,
        score: matched.length + strengthSum,
      });
    }

    matches.sort((a, b) => b.score - a.score);
    return matches;
  }, [childId, symptoms, stats]);
}
