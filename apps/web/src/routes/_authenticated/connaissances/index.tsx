import { createFileRoute, Link } from "@tanstack/react-router";
import { Library, Clock, ArrowRight, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articles } from "@/lib/resources-data";
import { ARTICLE_SUBJECTS } from "@/lib/resources-types";
import { useTranslation } from "react-i18next";
import { getClusterTheme } from "@/components/article/article-elements";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/connaissances/")({
  component: ConnaissancesIndex,
  staticData: {
    crumb: "nav.knowledgeBase",
  },
});

function ConnaissancesIndex() {
  const { t } = useTranslation();

  const featured = articles.find((a) => a.featured);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Library className="size-6 text-primary" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("news.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("news.subtitle")}</p>

        <aside className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            Une bibliothèque pour les jours plus difficiles comme pour les
            jours plus calmes. Lisez à votre rythme, chaque article est
            pensé pour vous accompagner, pas pour vous juger.
          </p>
        </aside>
      </div>

      {/* Featured article */}
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
                      {t("news.readMore")}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </span>
                </CardContent>
              </div>
            </Card>
          </Link>
        );
      })()}

      {/* Articles grouped by subject */}
      {ARTICLE_SUBJECTS.map((subject) => {
        const subjectArticles = articles.filter(
          (a) => !a.featured && a.cluster === subject
        );
        if (subjectArticles.length === 0) return null;

        return (
          <section key={subject} className="mb-10 last:mb-0">
            <h2 className="font-heading mb-4 text-xl font-semibold tracking-tight">
              {subject}
            </h2>
            <div className="space-y-4">
              {subjectArticles.map((article) => {
                const aTheme = getClusterTheme(article.cluster);
                const AIcon = aTheme.icon;
                return (
                  <Link
                    key={article.slug}
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
                              aTheme.iconBg,
                              aTheme.iconColor,
                            )}
                          >
                            <AIcon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Clock className="size-3" />
                              <span>{article.readTime}</span>
                            </div>
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
                          {t("news.readMore")}
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
