import { useTranslation } from "react-i18next";
import { Star, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getChildEmoji, formatAgeRange } from "@/lib/utils";
import { tagConfig } from "@/components/journal/journal-card-data";
import type { JournalTag, CrisisItem, BarkleyStep } from "@focusflow/validators";
import type { Child } from "@focusflow/validators";
import type { SymptomPoint } from "@/hooks/use-stats";
import { KpiBox } from "./kpi-box";
import { Sparkline } from "./sparkline";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function trendLabel(t: "up" | "down" | "stable" | null): string {
  if (t === "up") return "↗ en progression";
  if (t === "down") return "↘ en baisse";
  if (t === "stable") return "→ stable";
  return "—";
}

export interface SymptomSummary {
  key: keyof Omit<SymptomPoint, "date">;
  label: string;
  average: number | null;
  trend: "up" | "down" | "stable" | null;
  samples: number;
  series: number[];
}

export interface BarkleyProgress {
  completed: BarkleyStep[];
  currentStep: number;
  total: number;
}

interface ReportDocumentProps {
  child: Child | undefined;
  isActive: boolean;
  periodLabel: string;
  periodStart: Date;
  now: Date;
  questions: string;
  stats: { symptoms: SymptomPoint[] } | null | undefined;
  symptomSummaries: SymptomSummary[];
  journalHighlights: Array<{
    id: string;
    date: string;
    text?: string | null;
    tags?: string[] | null;
  }>;
  crisisCount: number;
  victoryCount: number;
  barkleyProgress: BarkleyProgress | null;
  crisisItems: CrisisItem[] | undefined;
}

export function ReportDocument({
  child,
  isActive,
  periodLabel,
  periodStart,
  now,
  questions,
  stats,
  symptomSummaries,
  journalHighlights,
  crisisCount,
  victoryCount,
  barkleyProgress,
  crisisItems,
}: ReportDocumentProps) {
  const { t } = useTranslation();

  return (
    <article className="report-document rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 md:p-10">
      <header className="report-header border-b border-border/60 pb-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Rapport TDAH · Tokō
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              {child ? `${child.name}` : "Enfant"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {child?.gender && (
                <span className="mr-2">
                  {getChildEmoji(child.gender)}{" "}
                  {child.gender === "male"
                    ? "Garçon"
                    : child.gender === "female"
                      ? "Fille"
                      : "—"}
                </span>
              )}
              {child?.ageRange && (
                <span>· {formatAgeRange(child.ageRange)}</span>
              )}
            </p>
          </div>
          <div className="text-left text-xs text-muted-foreground sm:text-right">
            <p>
              Période : {formatDate(periodStart)} → {formatDate(now)}
            </p>
            <p className="mt-1">Généré le {formatDate(now)}</p>
          </div>
        </div>
      </header>

      {/* Parent questions (if any) */}
      {questions.trim() && (
        <section className="report-section report-questions-box mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            Questions du parent
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {questions.trim()}
          </p>
        </section>
      )}

      {/* Overview */}
      <section className="report-section mt-6">
        <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Synthèse de la période ({periodLabel})
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiBox
            label="Entrées journal"
            value={String(journalHighlights.length)}
          />
          <KpiBox
            label="Jours suivis"
            value={String(stats?.symptoms?.length ?? 0)}
          />
          <KpiBox label="Crises notées" value={String(crisisCount)} />
          <KpiBox label="Victoires notées" value={String(victoryCount)} />
        </div>
      </section>

      {/* Symptom averages with sparklines */}
      <section className="report-section mt-8">
        <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Moyennes par dimension (échelle 1-5)
        </h3>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Dimension
                </th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                  Moyenne
                </th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                  Évolution
                </th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                  Tendance
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Relevés
                </th>
              </tr>
            </thead>
            <tbody>
              {symptomSummaries.map((s, i) => (
                <tr key={s.key} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                  <td className="px-3 py-2 font-medium text-foreground">
                    {s.label}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.average !== null ? s.average.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2 text-center text-primary">
                    <Sparkline values={s.series} />
                  </td>
                  <td className="px-3 py-2 text-center text-muted-foreground">
                    {trendLabel(s.trend)}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {s.samples}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tendance calculée sur la 2<sup>de</sup> moitié de la période vs la
          1<sup>re</sup>. Seuil de stabilité : ±0,3 point.
        </p>
      </section>

      {/* Journal highlights */}
      <section className="report-section mt-8">
        <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Moments marquants du journal
        </h3>
        {journalHighlights.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune entrée de journal sur cette période.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {journalHighlights.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {entry.tags.map((tag: string) => {
                        const cfg = tagConfig[tag as JournalTag];
                        return (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-2xs"
                          >
                            {cfg ? t(cfg.labelKey) : tag}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                {entry.text && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                    {entry.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Barkley progress section */}
      {barkleyProgress && (
        <section className="report-section mt-8">
          <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4" />
              Programme Barkley
            </span>
          </h3>
          <div className="mt-3 rounded-lg border border-border/60 p-4">
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <span className="font-semibold">{barkleyProgress.completed.length}</span>
                <span className="text-muted-foreground"> / {barkleyProgress.total} étapes complétées</span>
              </div>
              {barkleyProgress.currentStep <= barkleyProgress.total && (
                <Badge variant="outline" className="text-xs">
                  Étape en cours : {barkleyProgress.currentStep}
                </Badge>
              )}
              {barkleyProgress.currentStep > barkleyProgress.total && (
                <Badge className="border-success-border bg-success-surface text-success-foreground text-xs">
                  Programme terminé
                </Badge>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(barkleyProgress.completed.length / barkleyProgress.total) * 100}%` }}
              />
            </div>
            {/* Completed steps list */}
            {barkleyProgress.completed.length > 0 && (
              <ul className="mt-3 space-y-1">
                {barkleyProgress.completed.map((step) => (
                  <li key={step.id} className="flex items-center gap-2 text-sm">
                    <span className="text-success-foreground">✓</span>
                    <span className="font-medium">Étape {step.stepNumber}</span>
                    {step.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(step.completedAt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Crisis list preview */}
      {crisisItems && crisisItems.length > 0 && (
        <section className="report-section mt-8">
          <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="size-4" />
              Liste de crise
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Stratégies de régulation configurées par le parent ({crisisItems.length} élément{crisisItems.length > 1 ? "s" : ""})
          </p>
          <ul className="mt-3 space-y-2">
            {crisisItems.map((item, i) => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                {item.emoji && <span>{item.emoji}</span>}
                <span className="text-foreground/90">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="report-footer mt-10 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
        <p>
          Ce rapport est généré à partir des données saisies par le parent.
          Il ne constitue pas un diagnostic médical.
        </p>
        <p className="mt-1">
          {isActive
            ? "Tokō · toko.app"
            : "Généré gratuitement avec Tokō — toko.app"}
        </p>
      </footer>
    </article>
  );
}
