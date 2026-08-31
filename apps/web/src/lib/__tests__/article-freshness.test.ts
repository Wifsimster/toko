import { describe, it, expect } from "vitest";
import { articles } from "../resources-data";
import { isNewArticle, NEW_ARTICLE_DAYS } from "../resources-types";

const daysAfter = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000);

describe("isNewArticle", () => {
  it("is false for an article without a publication date", () => {
    expect(isNewArticle({})).toBe(false);
  });

  it("is true on the day of publication", () => {
    expect(
      isNewArticle({ publishedAt: "2026-08-31" }, daysAfter("2026-08-31", 0))
    ).toBe(true);
  });

  it("is true within the freshness window", () => {
    expect(
      isNewArticle(
        { publishedAt: "2026-08-31" },
        daysAfter("2026-08-31", NEW_ARTICLE_DAYS - 1)
      )
    ).toBe(true);
  });

  it("expires on its own once the window has passed", () => {
    expect(
      isNewArticle(
        { publishedAt: "2026-08-31" },
        daysAfter("2026-08-31", NEW_ARTICLE_DAYS + 1)
      )
    ).toBe(false);
  });

  it("ignores a malformed date", () => {
    expect(isNewArticle({ publishedAt: "pas une date" })).toBe(false);
  });
});

describe("published articles", () => {
  it("every publication date is a valid ISO day", () => {
    for (const article of articles) {
      if (!article.publishedAt) continue;
      expect(
        article.publishedAt,
        `invalid publishedAt on ${article.slug}`
      ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
