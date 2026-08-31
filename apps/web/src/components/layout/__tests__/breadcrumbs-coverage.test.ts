import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROUTES_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../routes/_authenticated"
);

function routeFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...routeFiles(path));
      continue;
    }
    // Only files that declare a route carry `staticData`; their colocated
    // page components and lazy halves do not.
    if (entry.name.endsWith(".tsx")) {
      const source = readFileSync(path, "utf-8");
      if (source.includes("createFileRoute(")) found.push(path);
    }
  }
  return found;
}

// A page whose route declares no crumb lands in the header with an empty
// trail, so the parent loses the "where am I" cue the breadcrumbs exist for.
describe("breadcrumb coverage", () => {
  it("gives every authenticated route a crumb", () => {
    const missing = routeFiles(ROUTES_DIR).filter((path) => {
      const source = readFileSync(path, "utf-8");
      return !source.includes("crumb:") && !source.includes("crumbLabel:");
    });

    expect(missing).toEqual([]);
  });
});
