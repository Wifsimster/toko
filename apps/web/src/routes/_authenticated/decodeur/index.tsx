import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Brain, Search, Lightbulb, HeartHandshake } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { BEHAVIOR_ENTRIES } from "@/lib/behavior-decoder-data";

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

function BehaviorCard({ id }: { id: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-2 text-base">
          <Brain
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="font-medium">
            {t(`decoder.entries.${id}.behavior`)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        <Section
          icon={
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-warning-foreground"
              aria-hidden="true"
            />
          }
          labelKey="decoder.explanationLabel"
          bodyKey={`decoder.entries.${id}.explanation`}
        />
        <Section
          icon={
            <HeartHandshake
              className="mt-0.5 size-4 shrink-0 text-success-foreground"
              aria-hidden="true"
            />
          }
          labelKey="decoder.tipLabel"
          bodyKey={`decoder.entries.${id}.tip`}
        />
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  labelKey,
  bodyKey,
}: {
  icon: React.ReactNode;
  labelKey: string;
  bodyKey: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t(labelKey)}
        </p>
        <p>{t(bodyKey)}</p>
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground space-y-2">
        <p>{t("decoder.empty", { query })}</p>
        <p className="text-xs">{t("decoder.emptyHint")}</p>
      </CardContent>
    </Card>
  );
}
