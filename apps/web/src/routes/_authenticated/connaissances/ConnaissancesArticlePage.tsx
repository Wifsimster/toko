import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { articles } from "@/lib/resources-data";
import {
  DEFAULT_LAST_REVIEWED,
  DEFAULT_REVIEWER,
} from "@/lib/resources-types";
import { useTranslation } from "react-i18next";
import {
  ArticleHero,
  ArticleToc,
  ArticleTocRail,
  useArticleToc,
  WelcomeIntro,
} from "@/components/article/article-elements";
import { getClusterTheme } from "@/components/article/article-cluster-theme";
import { withSectionScenes } from "@/components/article/article-section-scene";
import { cn } from "@/lib/utils";
import { parseISODate } from "@/lib/date";

const route = getRouteApi("/_authenticated/connaissances/$slug");

export function ConnaissancesArticlePage() {
  const { article } = route.useLoaderData();
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);

  const reviewedOn = parseISODate(
    article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED,
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tocEntries = useArticleToc(bodyRef, article.slug);
  const content = useMemo(
    () => withSectionScenes(article.content, article.slug),
    [article.content, article.slug],
  );

  return (
    <article className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
      <Link
        to="/connaissances"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t("articles.backToList")}
      </Link>

      <ArticleHero
        slug={article.slug}
        cluster={article.cluster}
        title={article.title}
        excerpt={article.excerpt}
        chips={[`${article.readTime} de lecture`, `Revu le ${reviewedOn}`]}
        reviewer={article.reviewer ?? DEFAULT_REVIEWER}
      />

      <div className="mt-10 lg:grid lg:grid-cols-[13rem_minmax(0,42rem)] lg:gap-14">
        <aside className="hidden lg:block">
          <ArticleTocRail entries={tocEntries} className="sticky top-6" />
        </aside>
        <div className="min-w-0">
      <WelcomeIntro audience={article.audience} />

      <ArticleToc
        entries={tocEntries}
        readTime={article.readTime}
        className="lg:hidden"
      />

      <div ref={bodyRef} className="article-body mt-8">
        {content}
      </div>

      {article.faq && article.faq.length > 0 && (
        <section className="mt-14 border-t border-border/60 pt-10">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">
            Questions fréquentes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les questions que les autres parents se posent le plus souvent.
          </p>
          <div className="mt-6 space-y-3">
            {article.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-border/60 bg-card/60 px-4 py-3 open:bg-card/90"
              >
                <summary className="cursor-pointer list-none font-heading text-base font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-brand-strong transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

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
                    <div className="flex h-full gap-3 rounded-lg border border-border/60 p-5 transition-all duration-300 hover:border-brand/20 hover:shadow-sm">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          rTheme.iconBg,
                          rTheme.iconColor,
                        )}
                      >
                        <RIcon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-brand-strong">
                          {r.cluster}
                        </p>
                        <p className="mt-1 font-heading font-semibold leading-snug group-hover:text-brand-strong">
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
        </div>
      </div>
    </article>
  );
}
