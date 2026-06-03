// Sequence templates for the visual timer. A sequence chains short
// timers so a parent doesn't have to reconfigure the timer between each
// step of a routine. This is the killer feature for the "épuisé" persona —
// it replaces the parent's voice repeating "next step now" at every
// transition.
//
// Sequences are built from the user's own routines (created in the
// Routines tab), where each step that has a duration becomes a chained
// timer step. When `completedStepIds` is supplied, already-checked steps
// for the day are skipped so a routine launched in the evening doesn't
// replay the morning items.

import type { Routine } from "@focusflow/validators";

export type SequenceStep = {
  label: string;
  emoji?: string;
  durationSec: number;
  /**
   * Routine step row this timer step maps back to. When present the
   * timer can mark the step complete via the existing routines API as
   * each step finishes, keeping the routines page in sync.
   */
  routineStepId?: string;
};

export type SequenceTemplate = {
  id: string;
  label: string;
  emoji: string;
  steps: SequenceStep[];
  /** Set when the sequence was derived from a user routine. */
  routineId?: string;
};

const FALLBACK_ROUTINE_EMOJI = "📋";

/**
 * Convert a user routine into a runnable sequence. Only steps with a
 * duration become timer steps — steps without a duration are checklist
 * items only, not timer-friendly. When `completedStepIds` is provided,
 * already-completed steps are filtered out so an evening run of the
 * bedtime routine doesn't replay items the kid already ticked at
 * snack-time. Returns null when nothing remains to run.
 */
export function routineToSequence(
  routine: Routine,
  completedStepIds?: ReadonlySet<string>,
): SequenceTemplate | null {
  const usable = routine.steps
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter((s) => (s.durationMinutes ?? 0) > 0)
    .filter((s) => !completedStepIds?.has(s.id));
  if (usable.length === 0) return null;
  return {
    id: `user-${routine.id}`,
    label: routine.name,
    emoji: routine.emoji ?? FALLBACK_ROUTINE_EMOJI,
    routineId: routine.id,
    steps: usable.map((s) => ({
      label: s.label,
      emoji: s.emoji ?? undefined,
      durationSec: (s.durationMinutes ?? 0) * 60,
      routineStepId: s.id,
    })),
  };
}

export function totalSequenceDurationSec(seq: SequenceTemplate): number {
  return seq.steps.reduce((sum, step) => sum + step.durationSec, 0);
}
