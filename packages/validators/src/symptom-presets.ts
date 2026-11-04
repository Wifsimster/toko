export type SymptomValues = {
  agitation: number;
  focus: number;
  impulse: number;
  mood: number;
  sleep: number;
  routinesOk: boolean;
};

export type DayLevel = "good" | "ok" | "hard";

export const SYMPTOM_NEUTRAL: SymptomValues = {
  agitation: 5,
  focus: 5,
  impulse: 5,
  mood: 5,
  sleep: 5,
  routinesOk: true,
};

export const SYMPTOM_PRESET_CALM: SymptomValues = {
  agitation: 3,
  focus: 7,
  impulse: 3,
  mood: 8,
  sleep: 7,
  routinesOk: true,
};

export const SYMPTOM_PRESET_TOUGH: SymptomValues = {
  agitation: 8,
  focus: 3,
  impulse: 8,
  mood: 3,
  sleep: 4,
  routinesOk: false,
};

export function symptomValuesOf(s: SymptomValues | null | undefined): SymptomValues {
  if (!s) return SYMPTOM_NEUTRAL;
  return {
    agitation: s.agitation,
    focus: s.focus,
    impulse: s.impulse,
    mood: s.mood,
    sleep: s.sleep,
    routinesOk: s.routinesOk,
  };
}

export function computeDayScore(s: Omit<SymptomValues, "routinesOk">): number {
  return (s.mood + s.focus + s.sleep + (10 - s.agitation) + (10 - s.impulse)) / 5;
}

export function levelFromScore(score: number): DayLevel {
  if (score >= 7) return "good";
  if (score >= 4) return "ok";
  return "hard";
}

export function dayLevelOf(s: Omit<SymptomValues, "routinesOk">): DayLevel {
  return levelFromScore(computeDayScore(s));
}
