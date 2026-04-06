import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Clock, ArrowRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNews } from "@/hooks/use-news";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/actualites/")({
  component: NewsIndex,
});

function formatDate(dateStr: string | null, locale: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

function NewsIndex() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const { data: articles, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sorted = articles ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("news.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t("news.subtitle")}
        </p>
      </div>

      {sorted.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {t("news.empty")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {t("news.emptyHint")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((article) => (
            <Link
              key={article.id}
              to="/actualites/$slug"
              params={{ slug: article.slug }}
              className="block"
            >
              <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{estimateReadTime(article.content)}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{formatDate(article.publishedAt, locale)}</span>
                  </div>
                  <CardTitle className="font-heading text-xl font-semibold leading-tight">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" size="sm" className="gap-1 px-0 text-primary">
                    {t("news.readMore")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
