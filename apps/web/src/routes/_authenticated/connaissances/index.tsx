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
  const isNew = isNewArticle(article);

  return (
    <Link
      to="/connaissances/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <Card className="gap-2 transition-colors hover:border-brand/30 hover:shadow-sm">
        <CardHeader className="flex flex-col gap-0">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <Clock className="size-3 shrink-0" />
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
          </div>
          {(showSubject || isNew) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {showSubject && (
                <Badge
                  variant="outline"
                  className={cn("max-w-full font-medium", theme.badge)}
                >
                  <Icon aria-hidden />
                  {subject}
                </Badge>
              )}
              {isNew && (
                <Badge variant="secondary">{t("articles.newBadge")}</Badge>
              )}
            </div>
          )}
          <CardTitle className="mt-2.5 font-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
            {article.title}
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 text-sm leading-relaxed">
            {article.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-0 text-brand-strong"
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
  const [sort, setSort] = useState<"recent" | "subject">("recent");

  const featured = articles.find((a) => a.featured);
  const listed = articles.filter((a) => !a.featured);
  const mostRecent = sortByRecency(listed);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="size-6 text-brand-strong" />
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">
            {t("articles.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("articles.subtitle")}</p>

        <aside className="mt-5 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
            <Sparkles className="size-4" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            Des articles pour les jours plus difficiles comme pour les jours
            plus calmes. Lisez à votre rythme, chaque article est pensé pour
            vous accompagner, pas pour vous juger.
          </p>
        </aside>

        <Link to="/lexique" className="mt-3 block">
          <Card className="transition-colors hover:border-brand/30 hover:shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-strong">
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

      {featured && (() => {
        const fTheme = getClusterTheme(featured.cluster);
        const FIcon = fTheme.icon;
        return (
          <Link
            to="/connaissances/$slug"
            params={{ slug: featured.slug }}
            className="mb-8 block"
          >
            <Card className="relative overflow-hidden border-brand/20 shadow-md shadow-brand/5 transition-colors hover:border-brand/30">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br",
                  fTheme.gradient,
                )}
              />
              <div className="relative">
                <CardHeader className="flex flex-col gap-0">
                  <Badge
                    variant="outline"
                    className={cn("max-w-full font-medium", fTheme.badge)}
                  >
                    <FIcon aria-hidden />
                    {featured.cluster.replace(/^Pillar · /, "")}
                  </Badge>
                  <CardTitle className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
                    {featured.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base leading-relaxed">
                    {featured.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{featured.readTime}</span>
                  <span className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-0 text-brand-strong"
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

        <TabsContent value="recent" className="mt-6 space-y-4">
          {mostRecent.map((article) => (
            <ArticleListCard key={article.slug} article={article} showSubject />
          ))}
        </TabsContent>

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
