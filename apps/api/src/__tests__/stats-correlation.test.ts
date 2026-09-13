import { describe, it, expect } from "vitest";
import {
  findStrongestCorrelation,
  MIN_SAMPLE,
  MIN_SYMPTOM_DAYS,
  type BehaviorLog,
} from "../lib/stats/correlation";
import type { SymptomPoint } from "../lib/stats/metrics";

// This is the one insight Tokō volunteers about a child. The thresholds
// decide whether a parent is told something on thin evidence, so they are
// worth asserting directly rather than through an HTTP fixture.

function days(n: number, over: Partial<SymptomPoint> = {}): SymptomPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, "0")}`,
    mood: 5,
    focus: 5,
    agitation: 5,
    impulse: 5,
    sleep: 5,
    ...over,
  }));
}

const BEHAVIOR = { id: "b1", name: "Ranger son cartable" };

/** `onCount` completed days at `onFocus`, the rest not completed at 3. */
function scenario(onCount: number, offCount: number, onFocus: number) {
  const symptoms: SymptomPoint[] = [];
  const logs: BehaviorLog[] = [];
  for (let i = 0; i < onCount + offCount; i++) {
    const date = `2026-03-${String(i + 1).padStart(2, "0")}`;
    const completed = i < onCount;
    symptoms.push({
      date,
      mood: 5,
      focus: completed ? onFocus : 3,
      agitation: 5,
      impulse: 5,
      sleep: 5,
    });
    logs.push({ behaviorId: BEHAVIOR.id, date, completed });
  }
  return { symptoms, logs };
}

describe("findStrongestCorrelation", () => {
  it("says nothing below the minimum number of logged days", () => {
    const { symptoms, logs } = scenario(5, 4, 9);
    expect(symptoms.length).toBeLessThan(MIN_SYMPTOM_DAYS);
    expect(findStrongestCorrelation(symptoms, [BEHAVIOR], logs)).toBeNull();
  });

  it("says nothing when there are no behaviours to correlate", () => {
    expect(findStrongestCorrelation(days(20), [], [])).toBeNull();
  });

  it("says nothing when one side has too few samples", () => {
    const { symptoms, logs } = scenario(MIN_SAMPLE - 1, 12, 9);
    expect(findStrongestCorrelation(symptoms, [BEHAVIOR], logs)).toBeNull();
  });

  it("says nothing when the difference is too small to matter", () => {
    const { symptoms, logs } = scenario(6, 6, 4); // 4 vs 3 — below MIN_DELTA
    expect(findStrongestCorrelation(symptoms, [BEHAVIOR], logs)).toBeNull();
  });

  it("reports a strong effect in French, with its sample sizes", () => {
    const { symptoms, logs } = scenario(6, 6, 9);
    const insight = findStrongestCorrelation(symptoms, [BEHAVIOR], logs);
    expect(insight).toMatchObject({
      behaviorName: "Ranger son cartable",
      dimension: "focus",
      dimensionLabel: "la concentration",
      onValue: 9,
      offValue: 3,
      delta: 6,
      sampleOn: 6,
      sampleOff: 6,
    });
  });

  it("treats lower agitation as the improvement, not higher", () => {
    const symptoms: SymptomPoint[] = [];
    const logs: BehaviorLog[] = [];
    for (let i = 0; i < 12; i++) {
      const date = `2026-03-${String(i + 1).padStart(2, "0")}`;
      const completed = i < 6;
      symptoms.push({
        date,
        mood: 5,
        focus: 5,
        agitation: completed ? 2 : 8,
        impulse: 5,
        sleep: 5,
      });
      logs.push({ behaviorId: BEHAVIOR.id, date, completed });
    }
    const insight = findStrongestCorrelation(symptoms, [BEHAVIOR], logs);
    expect(insight?.dimension).toBe("agitation");
    expect(insight?.delta).toBe(6);
  });

  it("returns only the strongest effect, never a table of weak ones", () => {
    const symptoms: SymptomPoint[] = [];
    const logs: BehaviorLog[] = [];
    for (let i = 0; i < 12; i++) {
      const date = `2026-03-${String(i + 1).padStart(2, "0")}`;
      const completed = i < 6;
      symptoms.push({
        date,
        mood: completed ? 7 : 5, // delta 2
        focus: completed ? 9 : 3, // delta 6 — the winner
        agitation: 5,
        impulse: 5,
        sleep: 5,
      });
      logs.push({ behaviorId: BEHAVIOR.id, date, completed });
    }
    const insight = findStrongestCorrelation(symptoms, [BEHAVIOR], logs);
    expect(insight?.dimension).toBe("focus");
  });

  it("ignores log days with no matching symptom entry", () => {
    const { symptoms, logs } = scenario(6, 6, 9);
    logs.push({ behaviorId: BEHAVIOR.id, date: "2099-01-01", completed: true });
    expect(
      findStrongestCorrelation(symptoms, [BEHAVIOR], logs)?.sampleOn,
    ).toBe(6);
  });
});
