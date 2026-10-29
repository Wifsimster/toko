export const PAIN_POINTS = ["shower", "homework", "bedtime", "meal"] as const;
export type PainPoint = (typeof PAIN_POINTS)[number];

function isPainPoint(value: string | null | undefined): value is PainPoint {
  return !!value && (PAIN_POINTS as readonly string[]).includes(value);
}

export function eveningContextPatch(
  existingContext: string | null | undefined,
  painPoint: PainPoint | null,
): string | undefined {
  if (painPoint) return painPoint;
  return isPainPoint(existingContext) ? "" : undefined;
}
