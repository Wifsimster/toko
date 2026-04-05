import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRelevantResources } from "@/hooks/use-relevant-resources";

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
 * Dismissible per-slug (persisted in localStorage) — respects Sophie's
 * "don't push content I don't ask for" constraint.
 */
export function ResourceHintCard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const recommendations = useRelevantResources(childId);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  const top = recommendations.find((r) => !dismissed.has(r.article.slug));
  if (!top) return null;

  const handleDismiss = () => {
    const next = new Set(dismissed);
    next.add(top.article.slug);
    setDismissed(next);
    persistDismissed(next);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          {t("resourceHint.title")}
        </CardTitle>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("resourceHint.dismiss")}
          className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-foreground">{top.article.title}</p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {top.article.excerpt}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{top.article.readTime}</span>
          <span aria-hidden="true">·</span>
          <span>{top.article.cluster.replace(/^Pillar · /, "")}</span>
        </div>
        <Link to="/ressources/$slug" params={{ slug: top.article.slug }}>
          <Button variant="outline" size="sm" className="w-full">
            {t("resourceHint.read")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
