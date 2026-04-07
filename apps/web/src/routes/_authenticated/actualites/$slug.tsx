import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { articles, DEFAULT_LAST_REVIEWED, DEFAULT_REVIEWER } from "@/lib/resources-data";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/actualites/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const { t } = useTranslation();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/actualites"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("news.backToList")}
      </Link>

      <header className="mb-8">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          {article.cluster}
        </Badge>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight lg:text-4xl lg:leading-[1.15]">
          {article.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} de lecture
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-xs">
            Révisé le{" "}
            {new Date(
              article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED
            ).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            — {article.reviewer ?? DEFAULT_REVIEWER}
          </span>
        </div>
      </header>

      <div className="article-body">{article.content}</div>

      {/* FAQ */}
      {article.faq && article.faq.length > 0 && (
        <section className="mt-14 border-t border-border/60 pt-10">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Questions fréquentes
          </h2>
          <div className="mt-6 space-y-3">
            {article.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-border/60 bg-card/60 px-4 py-3 open:bg-card/90"
              >
                <summary className="cursor-pointer list-none font-heading text-base font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-primary transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related articles */}
      {article.related.length > 0 && (
        <section className="mt-16 border-t border-border/60 pt-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            À lire ensuite
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {article.related
              .map((slug) => articles.find((a) => a.slug === slug))
              .filter((a): a is NonNullable<typeof a> => !!a)
              .map((r) => (
                <Link
                  key={r.slug}
                  to="/actualites/$slug"
                  params={{ slug: r.slug }}
                  className="group"
                >
                  <div className="h-full rounded-lg border border-border/60 p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                    <p className="text-xs font-medium text-primary/80">
                      {r.cluster}
                    </p>
                    <p className="mt-2 font-heading font-semibold leading-snug group-hover:text-primary">
                      {r.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {r.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      <p className="mt-10 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Ces stratégies s'ajoutent — elles ne remplacent pas — l'évaluation
        médicale. Si les difficultés persistent malgré une bonne structure
        au quotidien, parlez-en à votre pédiatre ou pédopsychiatre.
      </p>
    </article>
  );
}
