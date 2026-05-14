// Sequence templates for the visual timer. A sequence chains short
// timers so a parent doesn't have to reconfigure the timer between each
// step of a routine ("matin", "devoirs", "coucher"). This is the killer
// feature for the "épuisé" persona — it replaces the parent's voice
// repeating "next step now" at every transition.
//
// Sequences come from two sources:
//   - built-in ready-made templates (translated via i18n)
//   - the user's own routines (created in the Routines tab), where each
//     step that has a duration becomes a chained timer step.

import type { TFunction } from "i18next";
import type { Routine } from "@focusflow/validators";

export type SequenceStep = {
  label: string;
  emoji?: string;
  durationSec: number;
};

export type SequenceTemplate = {
  id: string;
  label: string;
  emoji: string;
  steps: SequenceStep[];
};

type BuiltinSequenceDef = {
  id: string;
  labelKey: string;
  emoji: string;
  steps: { labelKey: string; durationSec: number }[];
};

const BUILTIN_SEQUENCES: BuiltinSequenceDef[] = [
  {
    id: "matin",
    labelKey: "timer.sequences.matin.label",
    emoji: "🌅",
    steps: [
      { labelKey: "timer.sequences.matin.steps.dressing", durationSec: 600 },
      { labelKey: "timer.sequences.matin.steps.breakfast", durationSec: 900 },
      { labelKey: "timer.sequences.matin.steps.teeth", durationSec: 180 },
    ],
  },
  {
    id: "devoirs",
    labelKey: "timer.sequences.devoirs.label",
    emoji: "📚",
    steps: [
      { labelKey: "timer.sequences.devoirs.steps.focus", durationSec: 900 },
      { labelKey: "timer.sequences.devoirs.steps.break", durationSec: 300 },
      { labelKey: "timer.sequences.devoirs.steps.review", durationSec: 600 },
    ],
  },
  {
    id: "coucher",
    labelKey: "timer.sequences.coucher.label",
    emoji: "🌙",
    steps: [
      { labelKey: "timer.sequences.coucher.steps.bath", durationSec: 600 },
      { labelKey: "timer.sequences.coucher.steps.teeth", durationSec: 180 },
      { labelKey: "timer.sequences.coucher.steps.story", durationSec: 600 },
    ],
  },
];

export function getBuiltinSequences(t: TFunction): SequenceTemplate[] {
  return BUILTIN_SEQUENCES.map((seq) => ({
    id: `builtin-${seq.id}`,
    label: t(seq.labelKey),
    emoji: seq.emoji,
    steps: seq.steps.map((step) => ({
      label: t(step.labelKey),
      durationSec: step.durationSec,
    })),
  }));
}

const FALLBACK_ROUTINE_EMOJI = "📋";

// Convert a user routine into a runnable sequence. Only steps with a
// duration become timer steps — steps without a duration are checklist
// items only, not timer-friendly. Returns null when no step is usable.
export function routineToSequence(routine: Routine): SequenceTemplate | null {
  const usable = routine.steps
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter((s) => (s.durationMinutes ?? 0) > 0);
  if (usable.length === 0) return null;
  return {
    id: `user-${routine.id}`,
    label: routine.name,
    emoji: routine.emoji ?? FALLBACK_ROUTINE_EMOJI,
    steps: usable.map((s) => ({
      label: s.label,
      emoji: s.emoji ?? undefined,
      durationSec: (s.durationMinutes ?? 0) * 60,
    })),
  };
}

export function totalSequenceDurationSec(seq: SequenceTemplate): number {
  return seq.steps.reduce((sum, step) => sum + step.durationSec, 0);
}
