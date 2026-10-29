import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(__dirname, "..", "..");
const FADED_FOCUS = /\b(?:ring|outline)-ring\/\d+|focus-visible:ring-destructive\/\d+/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : files(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

describe("anneau de focus", () => {
  it("n'est jamais rendu transparent (contraste ≥ 3:1)", () => {
    const offenders = files(SRC)
      .filter((f) => FADED_FOCUS.test(readFileSync(f, "utf-8")))
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
