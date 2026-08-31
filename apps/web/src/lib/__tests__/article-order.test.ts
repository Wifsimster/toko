import { describe, it, expect } from "vitest";
import { articles } from "../resources-data";
import { sortByRecency } from "../resources-types";

type Sample = { slug: string; publishedAt?: string };

const sample = (list: Sample[]) => list;
const slugs = (list: { slug: string }[]) => list.map((a) => a.slug);

describe("sortByRecency", () => {
  it("puts the most recently published article first", () => {
    const sorted = sortByRecency(sample([
      { slug: "b", publishedAt: "2026-03-01" },
      { slug: "a", publishedAt: "2026-08-31" },
      { slug: "c", publishedAt: "2026-01-15" },
    ]));
    expect(slugs(sorted)).toEqual(["a", "b", "c"]);
  });

  it("ranks dated articles above undated ones", () => {
    const sorted = sortByRecency(sample([
      { slug: "undated" },
      { slug: "dated", publishedAt: "2026-01-01" },
    ]));
    expect(slugs(sorted)).toEqual(["dated", "undated"]);
  });

  it("treats a later position in the list as more recent when undated", () => {
    const sorted = sortByRecency(sample([
      { slug: "oldest" },
      { slug: "middle" },
      { slug: "newest" },
    ]));
    expect(slugs(sorted)).toEqual(["newest", "middle", "oldest"]);
  });

  it("falls back to declaration order for articles sharing a date", () => {
    const sorted = sortByRecency(sample([
      { slug: "first", publishedAt: "2026-08-31" },
      { slug: "second", publishedAt: "2026-08-31" },
    ]));
    expect(slugs(sorted)).toEqual(["second", "first"]);
  });

  it("does not add, drop or duplicate an article", () => {
    const sorted = sortByRecency(articles);
    expect(sorted).toHaveLength(articles.length);
    expect(new Set(slugs(sorted)).size).toBe(articles.length);
  });

  it("never places a dated article after an undated one", () => {
    const sorted = sortByRecency(articles);
    const firstUndated = sorted.findIndex((a) => !a.publishedAt);
    if (firstUndated === -1) return;
    expect(sorted.slice(firstUndated).every((a) => !a.publishedAt)).toBe(true);
  });
});
