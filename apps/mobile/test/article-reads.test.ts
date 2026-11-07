import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { articleStatuses, countUnseenArticles } from "../../../packages/validators/src/article-read";
import { ARTICLE_DEFAULT_REVIEWED, articleDates } from "../src/lib/knowledge-dates";
import { articles } from "../src/lib/copy";

const web = readFileSync(resolve(__dirname, "../../web/src/lib/resources-data.tsx"), "utf8");
const webTypes = readFileSync(resolve(__dirname, "../../web/src/lib/resources-types.ts"), "utf8");

function webDates(): Map<string, { publishedAt?: string; lastReviewedAt?: string }> {
  const starts = [...web.matchAll(/^\s+slug: "([^"]+)"/gm)];
  return new Map(
    starts.map((m, i) => {
      const seg = web.slice(m.index, starts[i + 1]?.index ?? web.length);
      return [
        m[1],
        {
          publishedAt: seg.match(/^\s+publishedAt: "([^"]+)"/m)?.[1],
          lastReviewedAt: seg.match(/^\s+lastReviewedAt: "([^"]+)"/m)?.[1],
        },
      ];
    }),
  );
}

describe("dates des articles", () => {
  it("reprennent celles du site, article par article", () => {
    const fromWeb = webDates();
    expect(articleDates.map((a) => a.slug).sort()).toEqual([...fromWeb.keys()].sort());
    for (const a of articleDates) {
      expect({ publishedAt: a.publishedAt, lastReviewedAt: a.lastReviewedAt }, a.slug).toEqual(fromWeb.get(a.slug));
    }
  });

  it("gardent la même date de révision par défaut que le site", () => {
    expect(webTypes).toContain(`DEFAULT_LAST_REVIEWED = "${ARTICLE_DEFAULT_REVIEWED}"`);
  });
});

describe("articles à découvrir", () => {
  it("compte le nouvel article pour un compte récent, et plus rien une fois lu", () => {
    const fresh = { accountCreatedAt: "2026-11-07T08:00:00.000Z", reads: [] };
    const statuses = articleStatuses(articleDates, fresh, ARTICLE_DEFAULT_REVIEWED);
    expect(statuses.get("sommeil-parent-tdah-melatonine")).toBe("new");
    const before = countUnseenArticles(statuses);
    expect(before).toBeGreaterThan(0);
    const readAll = {
      ...fresh,
      reads: articleDates.map((a) => ({ slug: a.slug, readAt: "2026-11-08T08:00:00.000Z" })),
    };
    expect(countUnseenArticles(articleStatuses(articleDates, readAll, ARTICLE_DEFAULT_REVIEWED))).toBe(0);
  });

  it("dit le nombre au singulier et au pluriel", () => {
    expect(articles.unseenCount(1)).toBe("1 article à découvrir");
    expect(articles.unseenCount(3)).toBe("3 articles à découvrir");
  });
});
