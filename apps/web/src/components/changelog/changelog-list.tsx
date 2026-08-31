import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { changelog, type ChangeKind, type ChangelogEntry } from "@/lib/changelog";
import { formatLongDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/** Combien de versions sont visibles avant d'avoir à en demander plus. */
const VISIBLE_VERSIONS = 5;

// Trois catégories, jamais plus : au-delà, le parent doit apprendre une
// taxonomie avant de lire une phrase. Les teintes viennent des tokens du
// thème pour rester lisibles en mode sombre.
const KIND_STYLES: Record<ChangeKind, { icon: typeof Sparkles; className: string }> = {
  new: {
    icon: Sparkles,
    className: "bg-success-surface text-success-foreground",
  },
  improved: {
    icon: TrendingUp,
    className: "bg-primary/10 text-primary",
  },
  fixed: {
    icon: Wrench,
    className: "bg-honey-surface text-honey-foreground",
  },
};

function ChangeBadge({ kind }: { kind: ChangeKind }) {
  const { t } = useTranslation();
  const { icon: Icon, className } = KIND_STYLES[kind];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {t(`changelog.kind.${kind}`)}
    </span>
  );
}

function VersionCard({ entry }: { entry: ChangelogEntry }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const isEnglish = i18n.resolvedLanguage === "en";

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle>
            {t("changelog.versionLabel", { version: entry.version })}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {formatLongDate(entry.date, locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {entry.changes.map((change, index) => {
            const detail = isEnglish ? change.detailEn : change.detailFr;
            return (
              <li
                key={`${entry.version}-${index}`}
                className="flex flex-col gap-1.5 sm:flex-row sm:gap-4"
              >
                <span className="sm:w-28 sm:shrink-0">
                  <ChangeBadge kind={change.kind} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {isEnglish ? change.en : change.fr}
                  </p>
                  {detail && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detail}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ChangelogList() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  if (changelog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("changelog.empty")}</p>
    );
  }

  const visible = showAll ? changelog : changelog.slice(0, VISIBLE_VERSIONS);
  const hasMore = !showAll && changelog.length > VISIBLE_VERSIONS;

  return (
    <div className="flex flex-col gap-4">
      {visible.map((entry) => (
        <VersionCard key={entry.version} entry={entry} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            {t("changelog.showOlder")}
            <ChevronDown className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      )}
    </div>
  );
}
