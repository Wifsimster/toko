export const BARKLEY_BLOCKS = [
  { key: "understand", from: 1, to: 3 },
  { key: "act", from: 4, to: 7 },
  { key: "anchor", from: 8, to: 10 },
] as const;

export type BarkleyBlockKey = (typeof BARKLEY_BLOCKS)[number]["key"];

export type LeafState = "done" | "current" | "upcoming";

export function currentStep(stepNumbers: readonly number[], completed: ReadonlySet<number>): number | null {
  return stepNumbers.find((n) => !completed.has(n)) ?? null;
}

export function leafState(stepNumber: number, completed: ReadonlySet<number>, current: number | null): LeafState {
  if (completed.has(stepNumber)) return "done";
  return stepNumber === current ? "current" : "upcoming";
}

export function blockFinished(
  block: (typeof BARKLEY_BLOCKS)[number],
  completed: ReadonlySet<number>,
  current: number | null,
): boolean {
  if (current === null) return false;
  for (let n = block.from; n <= block.to; n++) if (!completed.has(n)) return false;
  return true;
}
