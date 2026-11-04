import { describe, expect, it } from "vitest";
import { GARDEN_LEAF_FRESH, GARDEN_MAX_DRAWN_LEAVES, gardenArt, gardenDrawnLeaves } from "../src/garden";

describe("gardenArt", () => {
  it("draws one leaf per pause up to the cap", () => {
    expect(gardenDrawnLeaves(0)).toBe(0);
    expect(gardenDrawnLeaves(3)).toBe(3);
    expect(gardenDrawnLeaves(500)).toBe(GARDEN_MAX_DRAWN_LEAVES);
    expect(gardenDrawnLeaves(-2)).toBe(0);
    expect(gardenDrawnLeaves(Number.NaN)).toBe(0);
  });

  it("keeps the pot and stem when the garden is empty", () => {
    expect(gardenArt(0).paths).toHaveLength(4);
  });

  it("marks only the newest leaf as fresh", () => {
    const leaves = gardenArt(4, { freshLast: true }).paths.slice(2, 6);
    expect(leaves.map((p) => p.fill === GARDEN_LEAF_FRESH)).toEqual([false, false, false, true]);
  });

  it("never emits NaN coordinates", () => {
    for (const n of [0, 1, 7, 14, 99]) {
      for (const p of gardenArt(n).paths) expect(p.d).not.toMatch(/NaN/);
    }
  });
});
