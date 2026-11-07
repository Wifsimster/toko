import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SETTLE_MS, WATCHDOG_MS, createScrollTracker } from "../src/lib/scroll-tracker";

describe("scroll tracker", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is false after begin then release", () => {
    const t = createScrollTracker(() => {});
    const a = {};
    t.begin(a);
    expect(t.isScrolling()).toBe(true);
    t.release(a);
    expect(t.isScrolling()).toBe(false);
  });

  it("stays true while another owner is scrolling", () => {
    const t = createScrollTracker(() => {});
    const a = {};
    const b = {};
    t.begin(a);
    t.begin(b);
    t.end(a);
    expect(t.isScrolling()).toBe(true);
    t.end(b);
    expect(t.isScrolling()).toBe(false);
  });

  it("clears via the watchdog when no end event arrives", () => {
    const t = createScrollTracker(() => {});
    t.begin({});
    vi.advanceTimersByTime(WATCHDOG_MS - 1);
    expect(t.isScrolling()).toBe(true);
    vi.advanceTimersByTime(2);
    expect(t.isScrolling()).toBe(false);
  });

  it("keeps the watchdog alive while scroll events keep arriving", () => {
    const t = createScrollTracker(() => {});
    const a = {};
    t.begin(a);
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(WATCHDOG_MS - 100);
      t.touch(a);
    }
    expect(t.isScrolling()).toBe(true);
  });

  it("settles shortly after a drag release", () => {
    const t = createScrollTracker(() => {});
    const a = {};
    t.begin(a);
    t.dragEnd(a);
    vi.advanceTimersByTime(SETTLE_MS + 1);
    expect(t.isScrolling()).toBe(false);
  });

  it("reports changes once per transition", () => {
    const calls: boolean[] = [];
    const t = createScrollTracker((v) => calls.push(v));
    const a = {};
    t.begin(a);
    t.begin(a);
    t.release(a);
    t.release(a);
    expect(calls).toEqual([true, false]);
  });
});
