/**
 * Whole seconds left before `endAt` (a `Date.now()` timestamp), never
 * negative. Rounded up so the dial reads "1" until the very last instant.
 *
 * The countdown is derived from the wall clock rather than decremented once
 * per tick: browsers throttle or freeze timers when the screen locks or the
 * tab is backgrounded, and a decrementing counter would then fall behind the
 * real time the child has been waiting.
 */
export function remainingSecAt(endAt: number, now: number): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}
