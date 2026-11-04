import { describe, expect, it } from "vitest";
import { readingMinutes } from "../barkley-content/reading-time";
import { getStepContent } from "../barkley-content";

describe("readingMinutes", () => {
  it("never goes below one minute", () => {
    expect(readingMinutes({})).toBe(1);
    expect(readingMinutes("deux mots")).toBe(1);
  });

  it("counts words in nested strings and arrays at 200 words a minute", () => {
    const words = Array.from({ length: 401 }, () => "mot").join(" ");
    expect(readingMinutes({ a: [words.slice(0, 800)], b: { c: words.slice(800) } })).toBe(3);
  });

  it("gives every Barkley step a plausible reading time", () => {
    for (let n = 1; n <= 10; n++) {
      const minutes = readingMinutes(getStepContent(n, "fr"));
      expect(minutes).toBeGreaterThanOrEqual(3);
      expect(minutes).toBeLessThanOrEqual(30);
    }
  });
});
