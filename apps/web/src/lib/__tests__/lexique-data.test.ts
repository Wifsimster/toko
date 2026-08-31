import { describe, it, expect } from "vitest";
import { lexiqueTerms } from "../lexique-data";
import { LEXIQUE_CATEGORIES } from "../lexique-types";
import { articles } from "../resources-data";

describe("lexique data", () => {
  it("has unique terms", () => {
    const terms = lexiqueTerms.map((t) => t.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("only uses declared categories", () => {
    const ids = new Set(LEXIQUE_CATEGORIES.map((c) => c.id));
    for (const entry of lexiqueTerms) {
      expect(ids.has(entry.category)).toBe(true);
    }
  });

  it("fills every declared category", () => {
    for (const category of LEXIQUE_CATEGORIES) {
      expect(
        lexiqueTerms.some((t) => t.category === category.id)
      ).toBe(true);
    }
  });

  it("links only to existing knowledge-base articles", () => {
    const slugs = new Set(articles.map((a) => a.slug));
    for (const entry of lexiqueTerms) {
      if (entry.relatedSlug) {
        expect(slugs.has(entry.relatedSlug)).toBe(true);
      }
    }
  });

  it("keeps definitions short and readable", () => {
    for (const entry of lexiqueTerms) {
      expect(entry.definition.length).toBeGreaterThan(20);
      expect(entry.definition.length).toBeLessThanOrEqual(280);
    }
  });
});
