import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import {
  articles,
  DEFAULT_LAST_REVIEWED,
  DEFAULT_REVIEWER,
} from "@/lib/resources-data";
import { useTranslation } from "react-i18next";
import {
  ArticleHero,
  WelcomeIntro,
  getClusterTheme,
} from "@/components/article/article-elements";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/connaissances/$slug")({
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
  const theme = getClusterTheme(article.cluster);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/connaissances"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("news.backToList")}
      </Link>

      <ArticleHero
        cluster={article.cluster}
        title={article.title}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} de lecture
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Révisé le{" "}
              {new Date(
                article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED,
              ).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              — {article.reviewer ?? DEFAULT_REVIEWER}
            </span>
          </>
        }
      />

      <WelcomeIntro audience={article.audience} />

      <div className="article-body">{article.content}</div>

      {/* FAQ */}
      {article.faq && article.faq.length > 0 && (
        <section className="mt-14 border-t border-border/60 pt-10">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Questions fréquentes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les questions que les autres parents se posent le plus souvent.
          </p>
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
          <p className="mt-2 text-sm text-muted-foreground">
            Pour aller plus loin, à votre rythme.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {article.related
              .map((slug) => articles.find((a) => a.slug === slug))
              .filter((a): a is NonNullable<typeof a> => !!a)
              .map((r) => {
                const rTheme = getClusterTheme(r.cluster);
                const RIcon = rTheme.icon;
                return (
                  <Link
                    key={r.slug}
                    to="/connaissances/$slug"
                    params={{ slug: r.slug }}
                    className="group"
                  >
                    <div className="flex h-full gap-3 rounded-lg border border-border/60 p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          rTheme.iconBg,
                          rTheme.iconColor,
                        )}
                      >
                        <RIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-primary/80">
                          {r.cluster}
                        </p>
                        <p className="mt-1 font-heading font-semibold leading-snug group-hover:text-primary">
                          {r.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {r.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
