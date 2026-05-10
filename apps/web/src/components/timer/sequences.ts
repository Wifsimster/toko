// Sequence templates for the visual timer. A sequence chains short
// timers so a parent doesn't have to reconfigure the timer between each
// step of a routine ("matin", "devoirs", "coucher"). This is the killer
// feature for the "épuisé" persona — it replaces the parent's voice
// repeating "next step now" at every transition.
//
// Slated for premium gating once the paywall infrastructure lands
// (see issue #184). Currently shipped free because there is no paywall
// code to honor, and `docs/freemium-ethics-policy.md` forbids surprise
// gating — better free now than gated retroactively.

export type SequenceStep = {
  /** i18n key under `timer.sequences.<sequenceId>.steps.<stepId>` */
  labelKey: string;
  durationSec: number;
};

export type SequenceTemplate = {
  id: string;
  /** i18n key under `timer.sequences.<sequenceId>.label` */
  labelKey: string;
  emoji: string;
  steps: SequenceStep[];
};

export const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
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

export function totalSequenceDurationSec(seq: SequenceTemplate): number {
  return seq.steps.reduce((sum, step) => sum + step.durationSec, 0);
}
