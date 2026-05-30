import { createFileRoute, notFound } from "@tanstack/react-router";
import { articles } from "@/lib/resources-data";
import { RessourcesArticlePage } from "./RessourcesArticlePage";

export const Route = createFileRoute("/ressources/$slug")({
  component: RessourcesArticlePage,
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});
