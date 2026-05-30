import { createFileRoute, notFound } from "@tanstack/react-router";
import { articles } from "@/lib/resources-data";
import { ConnaissancesArticlePage } from "./ConnaissancesArticlePage";

export const Route = createFileRoute("/_authenticated/connaissances/$slug")({
  component: ConnaissancesArticlePage,
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});
