import { describe, it, expect } from "vitest";
import type { TFunction } from "i18next";
import { buildCrumbs } from "../breadcrumbs";
import { Route as ArticleRoute } from "@/routes/_authenticated/connaissances/$slug";
import { Route as FormationStepRoute } from "@/routes/_authenticated/barkley/formation/$stepNumber";
import { articles } from "@/lib/resources-data";
import fr from "@/lib/i18n/locales/fr.json";

// Stands in for i18next: resolves the dotted key against fr.json and fills
// the `{{placeholders}}`, so the test asserts on the French a parent reads.
const t = ((key: string, vars?: Record<string, unknown>) => {
  const value = key
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], fr);
  if (typeof value !== "string") return key;
  return value.replace(/{{(\w+)}}/g, (_, name) => String(vars?.[name] ?? ""));
}) as unknown as TFunction;

describe("buildCrumbs", () => {
  it("skips routes that declare no crumb", () => {
    expect(
      buildCrumbs([{ pathname: "/_authenticated", params: {} }], t)
    ).toEqual([]);
  });

  it("keeps a top-level page to a single crumb", () => {
    expect(
      buildCrumbs(
        [
          { pathname: "/_authenticated", params: {} },
          {
            pathname: "/journal",
            params: {},
            staticData: { crumb: "nav.journal" },
          },
        ],
        t
      )
    ).toEqual([{ to: "/journal", label: "Journal" }]);
  });

  it("puts an article under its section, titled with the article", () => {
    const article = articles[0]!;

    expect(
      buildCrumbs(
        [
          {
            pathname: `/connaissances/${article.slug}`,
            params: { slug: article.slug },
            staticData: ArticleRoute.options.staticData,
          },
        ],
        t
      )
    ).toEqual([
      { to: "/connaissances", label: "Articles" },
      { to: `/connaissances/${article.slug}`, label: article.title },
    ]);
  });

  it("puts a formation step under the Barkley programme", () => {
    expect(
      buildCrumbs(
        [
          {
            pathname: "/barkley/formation/3",
            params: { stepNumber: "3" },
            staticData: FormationStepRoute.options.staticData,
          },
        ],
        t
      )
    ).toEqual([
      { to: "/barkley", label: "Programme Barkley" },
      { to: "/barkley/formation/3", label: "Étape 3" },
    ]);
  });

  it("does not repeat a section the trail already reached", () => {
    const crumbs = buildCrumbs(
      [
        {
          pathname: "/connaissances",
          params: {},
          staticData: { crumb: "nav.articles" },
        },
        {
          pathname: "/connaissances/x",
          params: { slug: "x" },
          staticData: {
            crumbParent: { to: "/connaissances", crumb: "nav.articles" },
            crumbLabel: () => "X",
          },
        },
      ],
      t
    );

    expect(crumbs.filter((c) => c.to === "/connaissances")).toHaveLength(1);
  });
});
