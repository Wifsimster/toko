import { describe, it, expect } from "vitest";
import {
  changelog,
  compareVersions,
  countChanges,
  entriesBetween,
  latestDocumentedVersion,
} from "../changelog";

describe("compareVersions", () => {
  it("orders by major, then minor, then patch", () => {
    expect(compareVersions("2.10.0", "2.9.0")).toBeGreaterThan(0);
    expect(compareVersions("2.9.0", "2.10.0")).toBeLessThan(0);
    expect(compareVersions("2.10.1", "2.10.0")).toBeGreaterThan(0);
    expect(compareVersions("2.10.0", "2.10.0")).toBe(0);
  });

  it("treats a missing segment as zero", () => {
    expect(compareVersions("2.10", "2.10.0")).toBe(0);
    expect(compareVersions("3", "2.99.99")).toBeGreaterThan(0);
  });
});

describe("entriesBetween", () => {
  it("excludes the version already seen and includes the one now running", () => {
    const between = entriesBetween("2.9.0", "2.10.0");
    expect(between.map((e) => e.version)).toEqual(["2.10.0"]);
  });

  it("returns nothing when the parent is already up to date", () => {
    expect(entriesBetween("2.10.0", "2.10.0")).toHaveLength(0);
  });

  it("returns nothing when the running build is older than what was seen", () => {
    expect(entriesBetween("2.10.0", "2.9.0")).toHaveLength(0);
  });
});

describe("countChanges", () => {
  it("adds up every line across the versions given", () => {
    expect(countChanges([])).toBe(0);
    expect(countChanges(changelog)).toBe(
      changelog.reduce((n, e) => n + e.changes.length, 0),
    );
  });
});

describe("the changelog itself", () => {
  it("runs from the most recent version to the oldest", () => {
    for (let i = 1; i < changelog.length; i += 1) {
      expect(
        compareVersions(changelog[i - 1]!.version, changelog[i]!.version),
      ).toBeGreaterThan(0);
    }
  });

  it("never ships a half-translated entry", () => {
    for (const entry of changelog) {
      for (const change of entry.changes) {
        expect(change.fr.trim()).not.toBe("");
        expect(change.en.trim()).not.toBe("");
        // Un détail écrit dans une langue doit exister dans l'autre.
        expect(Boolean(change.detailFr)).toBe(Boolean(change.detailEn));
      }
    }
  });

  it("dates every version as a plain calendar day", () => {
    for (const entry of changelog) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
    }
  });

  it("says something on every version it documents", () => {
    for (const entry of changelog) {
      expect(entry.changes.length).toBeGreaterThan(0);
    }
  });

  it("names the newest documented version", () => {
    expect(latestDocumentedVersion()).toBe(changelog[0]?.version ?? null);
  });
});
