import { describe, expect, it } from "vitest";
import { getAllStepTitles, getStepContent } from "../src/lib/barkley-content";
import { BARKLEY_BLOCKS, blockFinished, currentStep, leafState } from "../src/lib/barkley-path";
import { readingMinutes } from "../src/lib/reading-time";

const ALL = Array.from({ length: 10 }, (_, i) => i + 1);

describe("readingMinutes", () => {
  it("never goes below one minute", () => {
    expect(readingMinutes({})).toBe(1);
    expect(readingMinutes(undefined)).toBe(1);
    expect(readingMinutes("deux mots")).toBe(1);
  });

  it("counts words in nested strings and arrays at 200 words a minute", () => {
    const words = Array.from({ length: 401 }, () => "mot").join(" ");
    expect(readingMinutes({ a: [words.slice(0, 800)], b: { c: words.slice(800) } })).toBe(3);
  });

  it("gives every Barkley step a plausible reading time", () => {
    for (const n of ALL) {
      const minutes = readingMinutes(getStepContent(n));
      expect(minutes).toBeGreaterThanOrEqual(3);
      expect(minutes).toBeLessThanOrEqual(30);
    }
  });
});

describe("chemin Barkley", () => {
  it("the current step is the first one not done", () => {
    expect(currentStep(ALL, new Set())).toBe(1);
    expect(currentStep(ALL, new Set([1, 2, 4]))).toBe(3);
    expect(currentStep(ALL, new Set(ALL))).toBeNull();
  });

  it("gives each position its state", () => {
    const done = new Set([1, 2]);
    expect(leafState(1, done, 3)).toBe("done");
    expect(leafState(3, done, 3)).toBe("current");
    expect(leafState(4, done, 3)).toBe("upcoming");
  });

  it("folds a block once all its steps are done, never when the program is over", () => {
    const [understand, act] = BARKLEY_BLOCKS;
    expect(blockFinished(understand, new Set([1, 2, 3]), 4)).toBe(true);
    expect(blockFinished(act, new Set([1, 2, 3]), 4)).toBe(false);
    expect(blockFinished(understand, new Set(ALL), null)).toBe(false);
  });

  it("blocks cover the ten steps of the app content", () => {
    const covered = BARKLEY_BLOCKS.flatMap((b) => Array.from({ length: b.to - b.from + 1 }, (_, i) => b.from + i));
    expect(covered).toEqual(getAllStepTitles().map((s) => s.stepNumber));
  });
});
