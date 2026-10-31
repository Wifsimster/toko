import type { Routine } from "@focusflow/validators";

export type SequenceStep = {
  label: string;
  emoji?: string;
  durationSec: number;
  routineStepId?: string;
};

export type SequenceTemplate = {
  id: string;
  label: string;
  emoji: string;
  steps: SequenceStep[];
  routineId?: string;
};

const FALLBACK_ROUTINE_EMOJI = "notebook";

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
