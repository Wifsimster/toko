import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
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
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/actualites/")({
  component: ActualitesIndex,
  staticData: { crumb: "nav.news" },
});

function ActualitesIndex() {
  const { t } = useTranslation();

  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("news.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("news.subtitle")}</p>
      </div>

      {/* Featured article */}
      {featured && (
        <Link
          to="/actualites/$slug"
          params={{ slug: featured.slug }}
          className="mb-8 block"
        >
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-accent/5 shadow-md shadow-primary/5 transition-colors hover:border-primary/30">
            <CardHeader>
              <Badge className="mb-3 w-fit">{featured.cluster}</Badge>
              <CardTitle className="font-heading text-2xl font-semibold lg:text-3xl">
                {featured.title}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {featured.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{featured.readTime}</span>
              <span className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-0 text-primary"
                >
                  {t("news.readMore")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* All other articles */}
      <div className="space-y-4">
        {rest.map((article) => (
          <Link
            key={article.slug}
            to="/actualites/$slug"
            params={{ slug: article.slug }}
            className="block"
          >
            <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Badge variant="outline" className="text-xs">
                    {article.cluster}
                  </Badge>
                  <span className="text-muted-foreground/40">·</span>
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
                <CardTitle className="font-heading text-xl font-semibold leading-tight">
                  {article.title}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-0 text-primary"
                >
                  {t("news.readMore")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
