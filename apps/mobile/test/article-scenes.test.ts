import { describe, expect, it } from "vitest";
import { articleSceneLoaders } from "../../../packages/mo/src/generated/articles";
import { knowledgeArticles } from "../src/lib/knowledge";
import { sectionIndexes } from "../src/lib/article-scenes";

describe("scènes des sections d'article dans l'app", () => {
  it("chaque dossier de scènes correspond à un article de l'app", () => {
    const slugs = new Set(knowledgeArticles.map((a) => a.slug));
    for (const slug of Object.keys(articleSceneLoaders)) expect(slugs.has(slug), slug).toBe(true);
  });

  it("un article illustré a une scène par H2, ni plus ni moins", () => {
    for (const article of knowledgeArticles) {
      const loaders = articleSceneLoaders[article.slug];
      if (!loaders) continue;
      const headings = article.body.filter((b) => b.type === "h2").length;
      expect(loaders.length, article.slug).toBe(headings);
    }
  });

  it("numérote les H2 dans l'ordre et laisse les autres blocs sans scène", () => {
    expect(
      sectionIndexes([
        { type: "p", text: "a" },
        { type: "h2", text: "b" },
        { type: "p", text: "c" },
        { type: "h3", text: "d" },
        { type: "h2", text: "e" },
      ]),
    ).toEqual([null, 0, null, null, 1]);
  });
});
