import { describe, it, expect } from "vitest";
import { isTunnelHour } from "../use-is-tunnel-hour";

function at(hour: number, minute = 0): Date {
  const d = new Date("2026-04-22T00:00:00");
  d.setHours(hour, minute, 0, 0);
  return d;
}

describe("isTunnelHour", () => {
  it("returns false before 16h30", () => {
    expect(isTunnelHour(at(16, 29))).toBe(false);
    expect(isTunnelHour(at(12, 0))).toBe(false);
  });

  it("returns true on the 16h30 boundary", () => {
    expect(isTunnelHour(at(16, 30))).toBe(true);
  });

  it("returns true during the tunnel", () => {
    expect(isTunnelHour(at(18, 45))).toBe(true);
    expect(isTunnelHour(at(20, 59))).toBe(true);
  });

  it("returns false at and after 21h00", () => {
    expect(isTunnelHour(at(21, 0))).toBe(false);
    expect(isTunnelHour(at(22, 0))).toBe(false);
  });
});
