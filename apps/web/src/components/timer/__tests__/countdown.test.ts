import { describe, it, expect } from "vitest";
import { remainingSecAt } from "../countdown";

describe("remainingSecAt", () => {
  it("rounds up partial seconds", () => {
    expect(remainingSecAt(10_000, 0)).toBe(10);
    expect(remainingSecAt(10_000, 100)).toBe(10);
    expect(remainingSecAt(10_000, 9_001)).toBe(1);
  });

  it("catches up after the screen was locked", () => {
    // 5 min timer, device asleep for 3 min: 2 min left, not 5.
    expect(remainingSecAt(300_000, 180_000)).toBe(120);
  });

  it("never goes negative", () => {
    expect(remainingSecAt(1_000, 60_000)).toBe(0);
  });
});
