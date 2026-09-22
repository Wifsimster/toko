import { describe, it, expect } from "vitest";
import { resolveActiveChildId } from "../use-active-child-sync";

const kids = [{ id: "a" }, { id: "b" }];

describe("resolveActiveChildId", () => {
  it("selects the first child when none is active (new login)", () => {
    expect(resolveActiveChildId(kids, null)).toBe("a");
  });

  it("keeps a still-valid selection", () => {
    expect(resolveActiveChildId(kids, "b")).toBeUndefined();
  });

  it("replaces a stale id (deleted child, other account on the device)", () => {
    expect(resolveActiveChildId(kids, "gone")).toBe("a");
  });

  it("clears the selection when the account has no child", () => {
    expect(resolveActiveChildId([], "gone")).toBeNull();
    expect(resolveActiveChildId([], null)).toBeUndefined();
  });
});
