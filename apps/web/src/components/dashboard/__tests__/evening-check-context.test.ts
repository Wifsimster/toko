import { describe, it, expect } from "vitest";
import { eveningContextPatch } from "../evening-check-context";

describe("eveningContextPatch", () => {
  it("sends the chosen pain point", () => {
    expect(eveningContextPatch(undefined, "homework")).toBe("homework");
    expect(eveningContextPatch("bedtime", "meal")).toBe("meal");
  });

  it("clears a pain point the evening check set earlier", () => {
    expect(eveningContextPatch("homework", null)).toBe("");
  });

  it("keeps free text typed in the full symptom form", () => {
    expect(eveningContextPatch("Anniversaire chez mamie", null)).toBeUndefined();
    expect(eveningContextPatch(null, null)).toBeUndefined();
  });
});
