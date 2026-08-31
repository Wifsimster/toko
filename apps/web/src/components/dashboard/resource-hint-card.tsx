import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRelevantResources } from "@/hooks/use-relevant-resources";
import { articles } from "@/lib/resources-data";
import { isNewArticle } from "@/lib/resources-types";

const DISMISS_STORAGE_KEY = "toko.resourceHint.dismissed";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistDismissed(set: Set<string>): void {
  try {
    window.localStorage.setItem(
      DISMISS_STORAGE_KEY,
      JSON.stringify([...set])
    );
  } catch {
    // localStorage disabled / quota — fail silent, card reappears next session
  }
}

/**
 * Surfaces a knowledge-base article that matches recent symptom patterns.
 * When no pattern matches, falls back to a freshly published article so a
 * timely piece (rentrée, vacances) still reaches parents whose week looks
 * calm — at most one card, dismissible per-slug (persisted in localStorage),
 * which keeps Sophie's "don't push content I don't ask for" constraint.
 */
export function ResourceHintCard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const recommendations = useRelevantResources(childId);
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissed());

  const matched = recommendations.find(
    (r) => !dismissed.has(r.article.slug)
  )?.article;
  const fresh = articles.find(
    (a) =>
      isNewArticle(a) && a.audience !== "entourage" && !dismissed.has(a.slug)
  );
  const article = matched ?? fresh;
  if (!article) return null;

  const handleDismiss = () => {
    const next = new Set(dismissed);
    next.add(article.slug);
    setDismissed(next);
    persistDismissed(next);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="size-4 text-primary" />
          {t("resourceHint.title")}
        </CardTitle>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("resourceHint.dismiss")}
          className="flex size-11 -my-3 -mr-2 shrink-0 items-center justify-center rounded text-muted-foreground/60 hover:text-foreground md:size-8 md:-my-1.5 md:-mr-1 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-foreground">
            {article.title}
            {isNewArticle(article) && (
              <>
                {" "}
                <Badge variant="secondary" className="align-middle">
                  {t("articles.newBadge")}
                </Badge>
              </>
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.readTime}</span>
          <span aria-hidden="true">·</span>
          <span>{article.cluster.replace(/^Pillar · /, "")}</span>
        </div>
        <Link to="/connaissances/$slug" params={{ slug: article.slug }}>
          <Button variant="outline" size="sm" className="w-full">
            {t("resourceHint.read")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
