export function remainingSecAt(endAt: number, now: number): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}
