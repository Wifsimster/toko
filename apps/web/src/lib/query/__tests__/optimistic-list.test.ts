import { describe, it, expect } from "vitest";
import { isOptimisticId, optimisticId, replaceItem } from "../optimistic-list";

describe("optimistic ids", () => {
  it("are recognisable and unique", () => {
    const a = optimisticId();
    const b = optimisticId();
    expect(isOptimisticId(a)).toBe(true);
    expect(isOptimisticId("3f2c-uuid")).toBe(false);
    expect(a).not.toBe(b);
  });
});

describe("replaceItem", () => {
  it("swaps the optimistic row for the saved one", () => {
    const list = [
      { id: "optimistic-x", mood: 7 },
      { id: "old", mood: 2 },
    ];
    expect(replaceItem(list, "optimistic-x", { id: "real", mood: 7 })).toEqual([
      { id: "real", mood: 7 },
      { id: "old", mood: 2 },
    ]);
  });

  it("leaves an empty cache alone", () => {
    expect(replaceItem(undefined, "x", { id: "y" })).toBeUndefined();
  });
});
