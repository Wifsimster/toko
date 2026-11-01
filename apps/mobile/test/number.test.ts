import { describe, expect, it } from "vitest";
import { formatFrDecimal } from "../src/lib/number";

describe("nombre décimal en français", () => {
  it("virgule décimale", () => {
    expect(formatFrDecimal(6.2)).toBe("6,2");
    expect(formatFrDecimal(-1.4)).toBe("-1,4");
  });

  it("entier inchangé", () => {
    expect(formatFrDecimal(7)).toBe("7");
  });
});
