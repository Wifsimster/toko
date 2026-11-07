import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookA } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { articles } from "@/lib/resources-data";
import {
  ARTICLE_SUBJECTS,
  isNewArticle,
  sortByRecency,
  type ResourceArticle,
} from "@/lib/resources-types";
import { useTranslation } from "react-i18next";
import { formatLongDate } from "@/lib/date";
import { Mo } from "@/components/mo/mo";
import { articleTheme } from "@/lib/article-themes";
import { cn } from "@/lib/utils";
import { frenchSpacing } from "@/lib/french-spacing";

export const Route = createFileRoute("/_authenticated/connaissances/")({
  component: ConnaissancesIndex,
  staticData: {
    crumb: "nav.articles",
  },
});

function ArticleListCard({
  article,
  showSubject = false,
}: {
  article: ResourceArticle;
  showSubject?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = articleTheme(article.slug);
  const subject = article.cluster.replace(/^Pillar · /, "");
  const isNew = isNewArticle(article);

  return (
    <Link
      to="/connaissances/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/10 transition-shadow hover:ring-brand/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className={cn("flex items-end justify-between gap-3 px-5 pt-4", theme.tile)}>
        <div className="flex flex-wrap items-center gap-1.5 pb-4">
          {showSubject && (
            <span className="rounded-full bg-card/75 px-2.5 py-1 text-xs font-semibold text-foreground">
              {subject}
            </span>
          )}
          {isNew && (
            <Badge variant="secondary">{t("articles.newBadge")}</Badge>
          )}
        </div>
        <Mo state={theme.mo} size={88} className="-mb-1" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-heading text-lg font-extrabold leading-snug tracking-tight text-balance group-hover:text-brand-strong">
          {frenchSpacing(article.title)}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {frenchSpacing(article.excerpt)}
        </p>
        <p className="mt-auto pt-4 text-xs text-muted-foreground">
          {article.readTime} de lecture
          {article.publishedAt && (
            <>
              {" · "}
              {t("articles.publishedOn", {
                date: formatLongDate(article.publishedAt, i18n.language, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              })}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

function FeaturedArticle({ article }: { article: ResourceArticle }) {
  const { t } = useTranslation();
  const theme = articleTheme(article.slug);

  return (
    <Link
      to="/connaissances/$slug"
      params={{ slug: article.slug }}
      className={cn(
        "group mb-10 flex flex-col-reverse gap-4 rounded-[2rem] px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        theme.tile,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
          À lire en premier · {article.readTime}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl">
          {frenchSpacing(article.title)}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/80">
          {frenchSpacing(article.excerpt)}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
          {t("articles.readMore")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <Mo state={theme.mo} size={112} className="sm:hidden" />
      <Mo state={theme.mo} size={176} className="hidden sm:inline-block" />
    </Link>
  );
}

function ConnaissancesIndex() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<"recent" | "subject">("recent");

  const featured = articles.find((a) => a.featured);
  const listed = articles.filter((a) => !a.featured);
  const mostRecent = sortByRecency(listed);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("articles.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-foreground/80">
            {t("articles.subtitle")}
          </p>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Pour les jours plus difficiles comme pour les jours plus calmes.
            Lisez à votre rythme.
          </p>
        </div>
        <Mo state="guide" size={120} />
      </header>

      {featured && <FeaturedArticle article={featured} />}

      <Tabs
        value={sort}
        onValueChange={(value) => setSort(value as "recent" | "subject")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList
            aria-label={t("articles.sortLabel")}
            className="grid w-full max-w-sm grid-cols-2"
          >
            <TabsTrigger value="recent">{t("articles.sortRecent")}</TabsTrigger>
            <TabsTrigger value="subject">{t("articles.sortSubject")}</TabsTrigger>
          </TabsList>
          <Link
            to="/lexique"
            className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2.5 text-sm font-semibold text-brand-strong ring-1 ring-foreground/10 hover:bg-muted sm:self-auto"
          >
            <BookA className="size-4" aria-hidden />
            {t("lexicon.title")}
          </Link>
        </div>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {mostRecent.map((article) => (
              <ArticleListCard key={article.slug} article={article} showSubject />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subject" className="mt-6">
          {ARTICLE_SUBJECTS.map((subject) => {
            const subjectArticles = listed.filter((a) => a.cluster === subject);
            if (subjectArticles.length === 0) return null;

            return (
              <section key={subject} className="mb-12 last:mb-0">
                <h2 className="mb-5 font-heading text-2xl font-extrabold tracking-tight">
                  {subject}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {sortByRecency(subjectArticles).map((article) => (
                    <ArticleListCard key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
