import { describe, it, expect } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { articleSceneCount, articleSceneLoaders } from "@focusflow/mo/articles";
import { articles } from "../resources-data";
import {
  ArticleSectionScene,
  sectionHeadingCount,
  withSectionScenes,
} from "@/components/article/article-section-scene";
import { SectionLoop } from "@/components/article/section-loop";

function deepHeadingCount(node: ReactNode): number {
  return Children.toArray(node).reduce<number>((n, child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return n;
    return n + (child.type === "h2" ? 1 : 0) + deepHeadingCount(child.props.children);
  }, 0);
}

describe("article section scenes", () => {
  const illustrated = articles.filter((a) => articleSceneCount(a.slug) > 0);

  it("covers at least one article", () => {
    expect(illustrated.length).toBeGreaterThan(0);
  });

  it("has no scene folder without a matching article", () => {
    const slugs = new Set(articles.map((a) => a.slug));
    for (const slug of Object.keys(articleSceneLoaders)) {
      expect(slugs.has(slug), `scenes for unknown article ${slug}`).toBe(true);
    }
  });

  it("gives every H2 of an illustrated article exactly one scene", () => {
    for (const article of illustrated) {
      const headings = sectionHeadingCount(article.content);
      expect(deepHeadingCount(article.content), `${article.slug}: every H2 must sit at the top level`).toBe(headings);
      expect(articleSceneCount(article.slug), `${article.slug}: scenes vs H2`).toBe(headings);
    }
  });

  it("places each scene right after its H2, in order", () => {
    for (const article of illustrated) {
      const nodes = Children.toArray(withSectionScenes(article.content, article.slug));
      let expected = 0;
      nodes.forEach((node, i) => {
        if (isValidElement<{ index: number }>(node) && node.type === ArticleSectionScene) {
          const previous = nodes[i - 1];
          expect(isValidElement(previous) && previous.type === "h2", article.slug).toBe(true);
          expect(node.props.index, article.slug).toBe(expected++);
        }
      });
      expect(expected, article.slug).toBe(articleSceneCount(article.slug));
    }
  });

  it("leaves articles without scenes untouched", () => {
    for (const article of articles.filter((a) => articleSceneCount(a.slug) === 0)) {
      expect(withSectionScenes(article.content, article.slug)).toBe(article.content);
    }
  });

  it("leaves no section loop in article content", () => {
    const loops = (node: ReactNode): number =>
      Children.toArray(node).reduce<number>((n, child) => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return n;
        return n + (child.type === SectionLoop ? 1 : 0) + loops(child.props.children);
      }, 0);
    for (const article of articles) expect(loops(article.content), article.slug).toBe(0);
  });
});
