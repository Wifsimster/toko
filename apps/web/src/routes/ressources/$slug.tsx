import { createFileRoute, notFound } from "@tanstack/react-router";
import { RessourcesArticlePage } from "./RessourcesArticlePage";

export const Route = createFileRoute("/ressources/$slug")({
  component: RessourcesArticlePage,
  // Imported on demand: the whole article library would otherwise ship in the
  // bundle shared by every public page.
  loader: async ({ params }) => {
    const { articles } = await import("@/lib/resources-data");
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});
