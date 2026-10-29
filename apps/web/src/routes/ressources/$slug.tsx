import { createFileRoute, notFound } from "@tanstack/react-router";
import { RessourcesArticlePage } from "./RessourcesArticlePage";

export const Route = createFileRoute("/ressources/$slug")({
  component: RessourcesArticlePage,
  loader: async ({ params }) => {
    const { articles } = await import("@/lib/resources-data");
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});
