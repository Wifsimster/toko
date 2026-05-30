import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { BEHAVIOR_ENTRIES } from "@/lib/behavior-decoder-data";
import { BehaviorCard } from "./behavior-card";
import { EmptyState } from "./empty-state";

export const Route = createFileRoute("/_authenticated/decodeur/")({
  component: BehaviorDecoderPage,
  staticData: { crumb: "nav.behaviorDecoder" },
});

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function BehaviorDecoderPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const matches = useMemo(() => {
    if (normalizedQuery.length === 0) return BEHAVIOR_ENTRIES;
    return BEHAVIOR_ENTRIES.filter((entry) => {
      const haystack = [
        t(`decoder.entries.${entry.id}.behavior`),
        ...entry.tags,
      ]
        .map(normalize)
        .join(" ");
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("decoder.title")}
        description={t("decoder.subtitle")}
      />

      <Card className="border-info-border bg-info-surface/40">
        <CardContent className="py-4 text-sm leading-relaxed text-foreground/90">
          {t("decoder.disclaimer")}
        </CardContent>
      </Card>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("decoder.searchPlaceholder")}
          aria-label={t("decoder.searchLabel")}
          className="pl-9 md:pl-9"
        />
      </div>

      {matches.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ul className="grid gap-3">
          {matches.map((entry) => (
            <li key={entry.id}>
              <BehaviorCard id={entry.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

