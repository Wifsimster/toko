import type { SymptomPoint } from "./metrics";

/**
 * "Les soirs où Lucas range son cartable, sa concentration est meilleure."
 *
 * Compares each dimension's average on days a behaviour was completed
 * against days it was not, and returns the single strongest effect. One
 * insight, never a table: the parent reading it has ADHD too, and a list of
 * weak correlations is worse than nothing.
 *
 * Pure, so the thresholds below can be exercised directly — they decide
 * whether a parent is told something about their child, which is not a
 * claim to make on three noisy data points.
 */

export const CORRELATION_DIMENSIONS = [
  "focus",
  "mood",
  "agitation",
  "impulse",
  "sleep",
] as const;

export type CorrelationDimension = (typeof CORRELATION_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<CorrelationDimension, string> = {
  focus: "la concentration",
  mood: "l'humeur",
  agitation: "l'agitation",
  impulse: "l'impulsivité",
  sleep: "le sommeil",
};

// On these, a higher rating is a better day; on the others it is worse.
const HIGHER_IS_BETTER = new Set<CorrelationDimension>([
  "focus",
  "mood",
  "sleep",
]);

/** Below these we say nothing at all. */
export const MIN_DELTA = 1.5;
export const MIN_SAMPLE = 3;
export const MIN_SYMPTOM_DAYS = 10;

export interface CorrelationInsight {
  behaviorName: string;
  dimension: CorrelationDimension;
  dimensionLabel: string;
  onValue: number;
  offValue: number;
  delta: number;
  sampleOn: number;
  sampleOff: number;
}

export interface BehaviorLog {
  behaviorId: string;
  date: string;
  completed: boolean;
}

export interface Behavior {
  id: string;
  name: string;
}

/**
 * Returns the strongest qualifying insight, or null when the data does not
 * support one.
 */
export function findStrongestCorrelation(
  symptoms: SymptomPoint[],
  behaviors: Behavior[],
  logs: BehaviorLog[],
): CorrelationInsight | null {
  if (symptoms.length < MIN_SYMPTOM_DAYS || behaviors.length === 0) {
    return null;
  }

  const symptomsByDate = new Map(symptoms.map((s) => [s.date, s]));

  // Bucket logs by behaviorId once — avoids an O(behaviors × logs) pass.
  const logsByBehavior = new Map<string, BehaviorLog[]>();
  for (const log of logs) {
    const bucket = logsByBehavior.get(log.behaviorId);
    if (bucket) bucket.push(log);
    else logsByBehavior.set(log.behaviorId, [log]);
  }

  let best: CorrelationInsight | null = null;

  for (const behavior of behaviors) {
    const onDays: SymptomPoint[] = [];
    const offDays: SymptomPoint[] = [];
    for (const log of logsByBehavior.get(behavior.id) ?? []) {
      const symptom = symptomsByDate.get(log.date);
      if (!symptom) continue;
      (log.completed ? onDays : offDays).push(symptom);
    }

    if (onDays.length < MIN_SAMPLE || offDays.length < MIN_SAMPLE) continue;

    for (const dimension of CORRELATION_DIMENSIONS) {
      const onAvg = mean(onDays, dimension);
      const offAvg = mean(offDays, dimension);
      const delta = HIGHER_IS_BETTER.has(dimension)
        ? onAvg - offAvg
        : offAvg - onAvg;
      if (delta < MIN_DELTA) continue;

      if (!best || delta > best.delta) {
        best = {
          behaviorName: behavior.name,
          dimension,
          dimensionLabel: DIMENSION_LABELS[dimension],
          onValue: round1(onAvg),
          offValue: round1(offAvg),
          delta: round1(delta),
          sampleOn: onDays.length,
          sampleOff: offDays.length,
        };
      }
    }
  }

  return best;
}

function mean(points: SymptomPoint[], dimension: CorrelationDimension): number {
  return points.reduce((sum, p) => sum + p[dimension], 0) / points.length;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
