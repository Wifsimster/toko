import { describe, it, expect } from "vitest";
import { isTunnelHourIn } from "../lib/tunnel-hour";

// Anchor everything on a winter UTC instant so DST doesn't drift the
// expectations. 2026-01-15T12:00:00Z = 13:00 Europe/Paris.
function utc(h: number, m = 0): Date {
  const d = new Date("2026-01-15T00:00:00Z");
  d.setUTCHours(h, m, 0, 0);
  return d;
}

describe("isTunnelHourIn — Europe/Paris (UTC+1 winter)", () => {
  it("false before 16h30 local", () => {
    expect(isTunnelHourIn("Europe/Paris", utc(15, 29))).toBe(false);
  });
  it("true at 16h30 local", () => {
    expect(isTunnelHourIn("Europe/Paris", utc(15, 30))).toBe(true);
  });
  it("true during the tunnel", () => {
    expect(isTunnelHourIn("Europe/Paris", utc(18, 0))).toBe(true);
  });
  it("false at 21h00 local", () => {
    expect(isTunnelHourIn("Europe/Paris", utc(20, 0))).toBe(false);
  });
});

describe("isTunnelHourIn — UTC zone", () => {
  it("uses the given timezone, not the server's", () => {
    expect(isTunnelHourIn("UTC", utc(18, 0))).toBe(true);
    expect(isTunnelHourIn("UTC", utc(12, 0))).toBe(false);
  });
});

describe("isTunnelHourIn — bad timezone", () => {
  it("returns false when the timezone is invalid", () => {
    expect(isTunnelHourIn("Mars/Olympus", utc(18, 0))).toBe(false);
  });
});
