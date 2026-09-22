// Sub-choices only surface when the parent reports a hard evening.
export const PAIN_POINTS = ["shower", "homework", "bedtime", "meal"] as const;
export type PainPoint = (typeof PAIN_POINTS)[number];

function isPainPoint(value: string | null | undefined): value is PainPoint {
  return !!value && (PAIN_POINTS as readonly string[]).includes(value);
}

/**
 * `context` to send with an evening check-in.
 *
 * - A pain point was chosen → that pain point.
 * - No pain point, but today's entry still carries one the evening check set
 *   earlier ("hard" then "good") → "" to clear it.
 * - Otherwise → undefined: leave alone any free text the parent typed in the
 *   full symptom form.
 */
export function eveningContextPatch(
  existingContext: string | null | undefined,
  painPoint: PainPoint | null,
): string | undefined {
  if (painPoint) return painPoint;
  return isPainPoint(existingContext) ? "" : undefined;
}
