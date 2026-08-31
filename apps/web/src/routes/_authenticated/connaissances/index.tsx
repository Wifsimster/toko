import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Clock, ArrowRight, Sparkles, BookA } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getClusterTheme } from "@/components/article/article-cluster-theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/connaissances/")({
  component: ConnaissancesIndex,
  staticData: {
    crumb: "nav.articles",
  },
});

/** One article in a list. `showSubject` is on in the date-sorted view, where
 * articles from every subject are mixed and the theme is no longer given by
 * the section heading above them. */
function ArticleListCard({
  article,
  showSubject = false,
}: {
  article: ResourceArticle;
  showSubject?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = getClusterTheme(article.cluster);
  const Icon = theme.icon;
  const subject = article.cluster.replace(/^Pillar · /, "");

  return (
    <Link
      to="/connaissances/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                theme.iconBg,
                theme.iconColor,
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{article.readTime}</span>
                {article.publishedAt && (
                  <span>
                    ·{" "}
                    {t("articles.publishedOn", {
                      date: formatLongDate(article.publishedAt, i18n.language, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    })}
                  </span>
                )}
                {isNewArticle(article) && (
                  <Badge variant="secondary">{t("articles.newBadge")}</Badge>
                )}
              </div>
              {showSubject && (
                <Badge variant="outline" className="mb-2 w-fit font-normal">
                  {subject}
                </Badge>
              )}
              <CardTitle className="font-heading text-xl font-semibold leading-tight">
                {article.title}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {article.excerpt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-0 text-primary"
          >
            {t("articles.readMore")}
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function ConnaissancesIndex() {
  const { t } = useTranslation();
  // Recency first: the list is a collection of articles that keeps growing,
  // so the newest one is what a parent coming back is looking for. The theme
  // view stays one tap away for a parent looking for a precise subject.
  const [sort, setSort] = useState<"recent" | "subject">("recent");

  const featured = articles.find((a) => a.featured);
  const listed = articles.filter((a) => !a.featured);
  const mostRecent = sortByRecency(listed);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="size-6 text-primary" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("articles.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("articles.subtitle")}</p>

        <aside className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            Des articles pour les jours plus difficiles comme pour les jours
            plus calmes. Lisez à votre rythme, chaque article est pensé pour
            vous accompagner, pas pour vous juger.
          </p>
        </aside>

        <Link to="/lexique" className="mt-3 block">
          <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookA className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold leading-tight">
                  {t("lexicon.title")}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("suiviHub.desc.lexicon")}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured article — pinned above both views */}
      {featured && (() => {
        const fTheme = getClusterTheme(featured.cluster);
        const FIcon = fTheme.icon;
        return (
          <Link
            to="/connaissances/$slug"
            params={{ slug: featured.slug }}
            className="mb-8 block"
          >
            <Card className="relative overflow-hidden border-primary/20 shadow-md shadow-primary/5 transition-colors hover:border-primary/30">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br dark:hidden",
                  fTheme.gradient,
                )}
              />
              <div className="relative">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                        fTheme.iconBg,
                        fTheme.iconColor,
                      )}
                    >
                      <FIcon className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge className="mb-3 w-fit">
                        {featured.cluster.replace(/^Pillar · /, "")}
                      </Badge>
                      <CardTitle className="font-heading text-2xl font-semibold lg:text-3xl">
                        {featured.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {featured.excerpt}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{featured.readTime}</span>
                  <span className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-0 text-primary"
                    >
                      {t("articles.readMore")}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </span>
                </CardContent>
              </div>
            </Card>
          </Link>
        );
      })()}

      <Tabs
        value={sort}
        onValueChange={(value) => setSort(value as "recent" | "subject")}
      >
        <TabsList
          aria-label={t("articles.sortLabel")}
          className="grid w-full max-w-sm grid-cols-2"
        >
          <TabsTrigger value="recent">{t("articles.sortRecent")}</TabsTrigger>
          <TabsTrigger value="subject">{t("articles.sortSubject")}</TabsTrigger>
        </TabsList>

        {/* Most recent first */}
        <TabsContent value="recent" className="mt-6 space-y-4">
          {mostRecent.map((article) => (
            <ArticleListCard key={article.slug} article={article} showSubject />
          ))}
        </TabsContent>

        {/* Grouped by subject */}
        <TabsContent value="subject" className="mt-6">
          {ARTICLE_SUBJECTS.map((subject) => {
            const subjectArticles = listed.filter((a) => a.cluster === subject);
            if (subjectArticles.length === 0) return null;

            return (
              <section key={subject} className="mb-10 last:mb-0">
                <h2 className="font-heading mb-4 text-xl font-semibold tracking-tight">
                  {subject}
                </h2>
                <div className="space-y-4">
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
