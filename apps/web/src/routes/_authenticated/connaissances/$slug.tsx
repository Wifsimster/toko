import { createFileRoute, notFound } from "@tanstack/react-router";
import { ConnaissancesArticlePage } from "./ConnaissancesArticlePage";

export const Route = createFileRoute("/_authenticated/connaissances/$slug")({
  component: ConnaissancesArticlePage,
  loader: async ({ params }) => {
    const { articles } = await import("@/lib/resources-data");
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  staticData: {
    crumbParent: { to: "/connaissances", crumb: "nav.articles" },
    crumbLabel: ({ loaderData }) =>
      (loaderData as { article?: { title: string } } | undefined)?.article?.title ?? "",
  },
});
