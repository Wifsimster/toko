import { describe, expect, it, vi } from "vitest";
import { chainScrollHandlers, createThresholdWatcher } from "../src/lib/scroll-to-top";

describe("threshold watcher", () => {
  it("fires only when the threshold is crossed", () => {
    const onChange = vi.fn();
    const watch = createThresholdWatcher(onChange);
    watch(10, 800);
    watch(500, 800);
    expect(onChange).not.toHaveBeenCalled();
    watch(801, 800);
    watch(1200, 800);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
    watch(800, 800);
    watch(0, 800);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("stays hidden until the viewport height is known", () => {
    const onChange = vi.fn();
    const watch = createThresholdWatcher(onChange);
    watch(5000, 0);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("chainScrollHandlers", () => {
  it("runs both handlers in order with the same event", () => {
    const calls: string[] = [];
    const event = { nativeEvent: { contentOffset: { y: 3 } } };
    const chained = chainScrollHandlers(
      (e: typeof event) => calls.push(`a${e.nativeEvent.contentOffset.y}`),
      (e) => calls.push(`b${e.nativeEvent.contentOffset.y}`),
    );
    chained(event);
    expect(calls).toEqual(["a3", "b3"]);
  });

  it("works without a first handler", () => {
    const second = vi.fn();
    chainScrollHandlers(undefined, second)({ x: 1 });
    expect(second).toHaveBeenCalledWith({ x: 1 });
  });
});
