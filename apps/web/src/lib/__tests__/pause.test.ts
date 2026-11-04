import { describe, expect, it } from "vitest";
import { formatCountdown, pausePhaseAt } from "../pause";

describe("pausePhaseAt", () => {
  it("follows the SOS breathing cycle of four 4-second phases", () => {
    expect(pausePhaseAt(0)).toBe("inhale");
    expect(pausePhaseAt(3999)).toBe("inhale");
    expect(pausePhaseAt(4000)).toBe("hold");
    expect(pausePhaseAt(8000)).toBe("exhale");
    expect(pausePhaseAt(12000)).toBe("rest");
    expect(pausePhaseAt(16000)).toBe("inhale");
  });

  it("treats invalid elapsed time as the start", () => {
    expect(pausePhaseAt(-50)).toBe("inhale");
    expect(pausePhaseAt(Number.NaN)).toBe("inhale");
  });
});

describe("formatCountdown", () => {
  it("rounds up to the next second so it never shows 0:00 early", () => {
    expect(formatCountdown(120000)).toBe("2:00");
    expect(formatCountdown(119001)).toBe("2:00");
    expect(formatCountdown(61000)).toBe("1:01");
    expect(formatCountdown(500)).toBe("0:01");
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(-10)).toBe("0:00");
  });
});
