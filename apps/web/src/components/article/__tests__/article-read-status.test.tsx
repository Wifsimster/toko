import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { articleStatuses, countUnseenArticles } from "@focusflow/validators";
import i18n from "@/lib/i18n";
import { articles } from "@/lib/resources-data";
import { DEFAULT_LAST_REVIEWED } from "@/lib/resources-types";
import { ArticleReadMark, ArticleStatusBadge } from "../article-read-status";

describe("article read status", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("fr");
  });

  it("labels new and updated articles, nothing for the others", () => {
    expect(renderToStaticMarkup(createElement(ArticleStatusBadge, { status: "new" }))).toContain("Nouveau");
    expect(renderToStaticMarkup(createElement(ArticleStatusBadge, { status: "updated" }))).toContain("Mis à jour");
    expect(renderToStaticMarkup(createElement(ArticleStatusBadge, { status: "read" }))).toBe("");
    expect(renderToStaticMarkup(createElement(ArticleStatusBadge, { status: "unread" }))).toBe("");
  });

  it("marks read articles quietly", () => {
    expect(renderToStaticMarkup(createElement(ArticleReadMark, { status: "read" }))).toContain("Lu");
    expect(renderToStaticMarkup(createElement(ArticleReadMark, { status: "new" }))).toBe("");
  });

  it("does not greet a new account with every article to discover", () => {
    const statuses = articleStatuses(
      articles,
      { accountCreatedAt: "2099-01-01T00:00:00.000Z", reads: [] },
      DEFAULT_LAST_REVIEWED,
    );
    expect(countUnseenArticles(statuses)).toBe(0);
  });

  it("clears the count once every article is read", () => {
    const statuses = articleStatuses(
      articles,
      {
        accountCreatedAt: "2026-01-01T00:00:00.000Z",
        reads: articles.map((a) => ({ slug: a.slug, readAt: "2099-01-01T00:00:00.000Z" })),
      },
      DEFAULT_LAST_REVIEWED,
    );
    expect(countUnseenArticles(statuses)).toBe(0);
  });
});
