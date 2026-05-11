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
  /** i18n key for built-in templates, or raw label for custom routines. */
  labelKey: string;
  durationSec: number;
};

export type SequenceTemplate = {
  id: string;
  /** i18n key for built-in templates, or raw name for custom routines. */
  labelKey: string;
  emoji: string;
  steps: SequenceStep[];
  /** True when the sequence was created by the parent (not a built-in template). */
  custom?: boolean;
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

// Custom sequences live in localStorage. Parents can have any number of
// routines tailored to their family's actual day. The schema mirrors
// SequenceTemplate so the runner can treat both uniformly.

const CUSTOM_SEQUENCES_STORAGE_KEY = "toko.timer.customSequences";

export function readCustomSequences(): SequenceTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_SEQUENCES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is SequenceTemplate => isValidStoredSequence(s))
      .map((s) => ({ ...s, custom: true }));
  } catch {
    return [];
  }
}

function isValidStoredSequence(s: unknown): s is SequenceTemplate {
  if (!s || typeof s !== "object") return false;
  const seq = s as Partial<SequenceTemplate>;
  return (
    typeof seq.id === "string" &&
    typeof seq.labelKey === "string" &&
    typeof seq.emoji === "string" &&
    Array.isArray(seq.steps) &&
    seq.steps.length > 0 &&
    seq.steps.every(
      (step) =>
        step &&
        typeof step.labelKey === "string" &&
        typeof step.durationSec === "number" &&
        step.durationSec > 0
    )
  );
}

function writeCustomSequences(seqs: SequenceTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialisable = seqs.map(({ custom: _custom, ...rest }) => rest);
    window.localStorage.setItem(
      CUSTOM_SEQUENCES_STORAGE_KEY,
      JSON.stringify(serialisable)
    );
  } catch {
    // fail silent — quota / disabled storage
  }
}

export function addCustomSequence(seq: SequenceTemplate): SequenceTemplate[] {
  const next = [...readCustomSequences(), { ...seq, custom: true }];
  writeCustomSequences(next);
  return next;
}

export function updateCustomSequence(
  seq: SequenceTemplate
): SequenceTemplate[] {
  const all = readCustomSequences();
  const next = all.some((s) => s.id === seq.id)
    ? all.map((s) => (s.id === seq.id ? { ...seq, custom: true } : s))
    : [...all, { ...seq, custom: true }];
  writeCustomSequences(next);
  return next;
}

export function deleteCustomSequence(id: string): SequenceTemplate[] {
  const next = readCustomSequences().filter((s) => s.id !== id);
  writeCustomSequences(next);
  return next;
}

export function generateCustomSequenceId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

