import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// TanStack Router's autoCodeSplitting cannot split a page component that the
// route file also exports: the whole page (and everything it imports) then
// ships in the bundle every visitor downloads. Three such exports once cost
// ~80 kB gzipped on the public pages, the quiz included.
const ROUTES = join(__dirname, "..", "..", "routes");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("route files", () => {
  it("never export a component next to their Route", () => {
    const offenders = files(ROUTES)
      .filter((f) => {
        const src = readFileSync(f, "utf-8");
        return src.includes("createFileRoute(") && /^export (function|const) (?!Route\b)[A-Z]/m.test(src);
      })
      .map((f) => relative(ROUTES, f));
    expect(offenders).toEqual([]);
  });
});
