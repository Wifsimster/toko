import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CrisisIcon } from "@/components/shared/crisis-icon";
import { TokoLogo } from "@/components/shared/toko-logo";
import { tagConfig } from "@/components/journal/journal-card-data";
import {
  formatReportScore,
  REPORT_HIGHER_IS_BETTER,
  type ReportDimension,
  type ReportTrendView,
} from "@focusflow/validators";
import type { JournalTag, CrisisItem, BarkleyStep, Child, Medication } from "@focusflow/validators";
import { parseDateValue } from "@/lib/date";
import { cn } from "@/lib/utils";
import { REPORT_DISCLAIMER, reportPrintCss, reportPrintPageName } from "@/lib/report-print";

function formatDate(d: Date | string) {
  return parseDateValue(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const GENDER_LABELS: Record<string, string> = { male: "Garçon", female: "Fille" };

const SCHEDULE_LABELS: Record<string, string> = {
  morning: "Matin",
  noon: "Midi",
  evening: "Soir",
  bedtime: "Coucher",
  custom: "Personnalisé",
};

const TREND_TONE_CLASS: Record<ReportTrendView["tone"], string> = {
  better: "text-success-foreground",
  worse: "text-danger-foreground",
  stable: "text-muted-foreground",
};

export type SynthesisSurface = "mint" | "peach" | "lavender" | "neutral";

const SURFACE_CLASS: Record<SynthesisSurface, string> = {
  mint: "bg-surface-mint",
  peach: "bg-surface-peach",
  lavender: "bg-surface-lavender",
  neutral: "bg-muted",
};

export interface SynthesisCard {
  value: string;
  label: string;
  surface: SynthesisSurface;
}

export interface SymptomSummary {
  key: ReportDimension;
  label: string;
  average: number | null;
  trend: ReportTrendView | null;
  samples: number;
}

export interface JournalEntrySummary {
  id: string;
  date: string;
  text?: string | null;
  tags?: string[] | null;
}

export const JOURNAL_HIGHLIGHT_LIMIT = 10;

export function childMeta(child: Pick<Child, "gender" | "ageRange"> | undefined): string {
  if (!child) return "";
  const meta: string[] = [];
  const gender = child.gender ? GENDER_LABELS[child.gender] : undefined;
  if (gender) meta.push(gender);
  if (child.ageRange) meta.push(`${child.ageRange.replace("-", " à ")} ans`);
  return meta.join(" · ");
}

export function synthesisCards({
  trackedDays,
  journalEntries,
  barkleySteps,
  medications,
}: {
  trackedDays: number;
  journalEntries: JournalEntrySummary[];
  barkleySteps: BarkleyStep[] | undefined;
  medications: Medication[] | undefined;
}): SynthesisCard[] {
  const crises = journalEntries.filter((e) => e.tags?.includes("crisis")).length;
  const barkleyDone = (barkleySteps ?? []).filter((s) => s.completedAt).length;
  const activeMeds = (medications ?? []).filter((m) => m.active).length;
  return [
    { value: String(trackedDays), label: "Jours suivis", surface: "mint" },
    { value: String(crises), label: "Crises notées", surface: "peach" },
    { value: `${barkleyDone}/10`, label: "Étapes Barkley", surface: "lavender" },
    { value: String(journalEntries.length), label: "Entrées du journal", surface: "neutral" },
    { value: String(activeMeds), label: "Traitements en cours", surface: "neutral" },
  ];
}

interface ReportDocumentProps {
  childId: string;
  child: Child | undefined;
  isActive: boolean;
  parentName: string;
  periodStart: Date;
  periodEnd: Date;
  now: Date;
  questions: string;
  trackedDays: number;
  symptomSummaries: SymptomSummary[];
  journalEntries: JournalEntrySummary[];
  barkleySteps: BarkleyStep[] | undefined;
  crisisItems: CrisisItem[] | undefined;
  medications: Medication[] | undefined;
}

function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-2xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </p>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="report-section-title flex items-center gap-2.5 font-heading text-base font-extrabold tracking-tight text-foreground"
    >
      <span aria-hidden="true" className="h-4 w-[3px] shrink-0 rounded-full bg-brand" />
      {children}
    </h3>
  );
}

function Section({
  title,
  children,
  keepTogether = false,
}: {
  title: string;
  children: ReactNode;
  keepTogether?: boolean;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("report-section mt-8", keepTogether && "report-keep")}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-muted-foreground/40 px-3 py-2.5 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function CoverBand({
  child,
  parentName,
  periodStart,
  periodEnd,
  now,
}: Pick<ReportDocumentProps, "child" | "parentName" | "periodStart" | "periodEnd" | "now">) {
  const meta = childMeta(child);
  const columns = [
    { label: "Période", value: `Du ${formatDate(periodStart)} au ${formatDate(periodEnd)}` },
    { label: "Données saisies par", value: parentName },
    { label: "Généré le", value: formatDate(now) },
  ];
  return (
    <header className="report-cover rounded-2xl border border-border bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <TokoLogo className="h-5" label="Tokō" />
        <p className="text-2xs font-semibold uppercase tracking-wider text-brand-strong">
          Rapport de suivi TDAH
        </p>
      </div>
      <hr className="my-4 border-border" />
      <Kicker>Enfant</Kicker>
      <h2 className="mt-1 break-words font-heading text-2xl font-extrabold tracking-tight text-foreground">
        {child?.name ?? "Enfant"}
      </h2>
      {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      <dl className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {columns.map((col) => (
          <div key={col.label} className="min-w-0 sm:px-4 sm:first:pl-0 sm:last:pr-0">
            <dt>
              <Kicker>{col.label}</Kicker>
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-foreground">{col.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function SynthesisSection({ cards }: { cards: SynthesisCard[] }) {
  return (
    <Section title="Synthèse de la période" keepTogether>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {cards.map((card) => (
          <li
            key={card.label}
            className={cn(
              "rounded-xl p-3 last:col-span-2 sm:last:col-span-1",
              SURFACE_CLASS[card.surface],
            )}
          >
            <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-1 text-xs font-semibold leading-snug text-muted-foreground">{card.label}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function DimensionTable({ summaries }: { summaries: SymptomSummary[] }) {
  if (summaries.every((s) => s.samples === 0)) {
    return (
      <Section title="Moyennes par dimension">
        <EmptyState>Aucun relevé de symptômes sur cette période.</EmptyState>
      </Section>
    );
  }
  return (
    <Section title="Moyennes par dimension" keepTogether>
      <table className="w-full table-fixed border-y-2 border-foreground text-sm">
        <thead>
          <tr className="text-left">
            <th scope="col" className="w-[34%] py-2 pr-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dimension
            </th>
            <th scope="col" className="w-[22%] py-2 pr-2 sm:w-[24%] text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Moyenne <span className="whitespace-nowrap">sur 10</span>
            </th>
            <th scope="col" className="py-2 pr-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tendance
            </th>
            <th scope="col" className="hidden w-16 py-2 text-right sm:table-cell text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Relevés
            </th>
          </tr>
        </thead>
        <tbody className="border-t border-foreground">
          {summaries.map((s) => (
            <tr key={s.key} className="border-t border-border first:border-t-0">
              <th scope="row" className="py-2 pr-2 text-left align-top font-normal">
                <span className="block font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {REPORT_HIGHER_IS_BETTER.has(s.key) ? "Plus haut = mieux" : "Plus bas = mieux"}
                </span>
                <span className="block text-xs text-muted-foreground sm:hidden">
                  {s.samples} relevé{s.samples > 1 ? "s" : ""}
                </span>
              </th>
              <td className="py-2 pr-2 align-top">
                {s.average === null ? (
                  <span className="text-muted-foreground">Pas de relevé</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-7 shrink-0 font-heading text-base font-extrabold tabular-nums text-foreground">
                      {formatReportScore(s.average)}
                    </span>
                    <span aria-hidden="true" className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-border sm:block">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${Math.min(Math.max(s.average, 0), 10) * 10}%` }}
                      />
                    </span>
                  </span>
                )}
              </td>
              <td className="py-2 pr-2 align-top">
                {s.trend ? (
                  <>
                    <span className={cn("block whitespace-nowrap font-semibold", TREND_TONE_CLASS[s.trend.tone])}>
                      <span aria-hidden="true">{s.trend.arrow} </span>
                      {s.trend.word}
                    </span>
                    <span className="block text-xs text-muted-foreground">{s.trend.delta} points</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Trop peu de relevés</span>
                )}
              </td>
              <td className="hidden py-2 text-right align-top font-semibold text-foreground sm:table-cell">{s.samples}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Tendance : écart entre la 2<sup>e</sup> et la 1<sup>re</sup> moitié de la période (4 relevés
        minimum). La flèche donne le sens de la variation, le mot dit si c'est mieux ou moins bien.
      </p>
    </Section>
  );
}

function MedicationsSection({ medications }: { medications: Medication[] | undefined }) {
  const meds = medications ?? [];
  const groups = [
    { label: "En cours", meds: meds.filter((m) => m.active) },
    { label: "Arrêtés", meds: meds.filter((m) => !m.active) },
  ].filter((g) => g.meds.length > 0);
  return (
    <Section title="Traitements">
      {groups.length === 0 ? (
        <EmptyState>Aucun traitement renseigné.</EmptyState>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <Kicker>
                {group.label} · {group.meds.length}
              </Kicker>
              <ul className="mt-2 space-y-2.5">
                {group.meds.map((m) => (
                  <li key={m.id} className="report-item">
                    <p className="font-semibold text-foreground">{m.dose ? `${m.name} · ${m.dose}` : m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SCHEDULE_LABELS[m.schedule] ?? m.schedule} ·{" "}
                      {m.endDate
                        ? `${formatDate(m.startDate)} – ${formatDate(m.endDate)}`
                        : `Depuis le ${formatDate(m.startDate)}`}
                    </p>
                    {m.notes && <p className="mt-0.5 text-sm text-foreground">Note : {m.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function JournalSection({ entries }: { entries: JournalEntrySummary[] }) {
  const { t } = useTranslation();
  const recent = entries.slice(0, JOURNAL_HIGHLIGHT_LIMIT);
  return (
    <Section title="Moments marquants du journal">
      {recent.length === 0 ? (
        <EmptyState>Aucune entrée de journal sur cette période.</EmptyState>
      ) : (
        <>
          {entries.length > recent.length && (
            <p className="mb-2 text-xs text-muted-foreground">
              Les {recent.length} entrées les plus récentes sur {entries.length}.
            </p>
          )}
          <ul className="divide-y divide-border">
            {recent.map((entry) => (
              <li key={entry.id} className="report-item py-2.5 first:pt-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-semibold text-brand-strong">{formatDate(entry.date)}</span>
                  {entry.tags?.map((tag) => {
                    const cfg = tagConfig[tag as JournalTag];
                    return (
                      <span
                        key={tag}
                        className={cn(
                          "rounded-full px-2 py-px text-2xs font-semibold text-foreground",
                          tag === "crisis" ? "bg-surface-peach" : "bg-muted",
                        )}
                      >
                        {cfg ? t(cfg.labelKey) : tag}
                      </span>
                    );
                  })}
                </div>
                {entry.text && (
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
                    {entry.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

function BarkleySection({ steps }: { steps: BarkleyStep[] | undefined }) {
  const completed = (steps ?? [])
    .filter((s) => s.completedAt)
    .sort((a, b) => a.stepNumber - b.stepNumber);
  const done = new Set(completed.map((s) => s.stepNumber));
  return (
    <Section title="Programme Barkley" keepTogether>
      {completed.length === 0 ? (
        <EmptyState>Programme pas encore commencé.</EmptyState>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">
            {done.size} étape{done.size > 1 ? "s" : ""} terminée{done.size > 1 ? "s" : ""} sur 10
          </p>
          <div aria-hidden="true" className="mt-2 grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <div key={n} className="text-center">
                <div
                  className={cn(
                    "h-2.5 rounded-[3px]",
                    done.has(n) ? "bg-brand" : "border border-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "mt-0.5 block text-2xs",
                    done.has(n) ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {n}
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {completed.map((s) => (
              <li key={s.id} className="flex items-baseline gap-2 text-sm">
                <span aria-hidden="true" className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-brand" />
                <span className="font-semibold text-foreground">Étape {s.stepNumber}</span>
                {s.completedAt && (
                  <span className="text-muted-foreground">· {formatDate(s.completedAt)}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

function CrisisSection({ items }: { items: CrisisItem[] | undefined }) {
  const list = items ?? [];
  return (
    <Section title="Liste de crise">
      {list.length === 0 ? (
        <EmptyState>Aucune stratégie de régulation enregistrée.</EmptyState>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {list.length} stratégie{list.length > 1 ? "s" : ""} de régulation, dans l'ordre choisi par le parent.
          </p>
          <ol className="mt-3 space-y-2">
            {list.map((item, i) => (
              <li key={item.id} className="report-item flex items-start gap-3 text-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-peach">
                  <CrisisIcon emoji={item.emoji} className="size-4 text-foreground" />
                </span>
                <span className="min-w-0 break-words pt-1 text-foreground">
                  <span className="font-semibold text-muted-foreground">{i + 1}. </span>
                  {item.label}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </Section>
  );
}

export function ReportDocument({
  childId,
  child,
  isActive,
  parentName,
  periodStart,
  periodEnd,
  now,
  questions,
  trackedDays,
  symptomSummaries,
  journalEntries,
  barkleySteps,
  crisisItems,
  medications,
}: ReportDocumentProps) {
  const pageName = reportPrintPageName(childId);
  const childName = child?.name ?? "Enfant";
  const trimmedQuestions = questions.trim();
  const questionsId = useId();

  return (
    <article
      data-print-page={pageName}
      aria-label={`Rapport de suivi TDAH de ${childName}`}
      className="report-document rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-8"
    >
      <style>
        {reportPrintCss({
          pageName,
          childName,
          period: `${formatDate(periodStart)} – ${formatDate(periodEnd)}`,
        })}
      </style>
      <CoverBand
        child={child}
        parentName={parentName}
        periodStart={periodStart}
        periodEnd={periodEnd}
        now={now}
      />

      {trimmedQuestions && (
        <section
          aria-labelledby={questionsId}
          className="report-section report-keep mt-6 flex gap-3 rounded-xl border border-muted-foreground/40 p-4"
        >
          <span aria-hidden="true" className="w-[3px] shrink-0 rounded-full bg-brand" />
          <div className="min-w-0">
            <h3 id={questionsId} className="text-sm font-semibold text-brand-strong">
              Questions du parent pour la consultation
            </h3>
            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
              {trimmedQuestions}
            </p>
          </div>
        </section>
      )}

      <SynthesisSection
        cards={synthesisCards({ trackedDays, journalEntries, barkleySteps, medications })}
      />
      <DimensionTable summaries={symptomSummaries} />
      <MedicationsSection medications={medications} />
      <JournalSection entries={journalEntries} />
      <BarkleySection steps={barkleySteps} />
      <CrisisSection items={crisisItems} />

      <footer className="report-footer mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TokoLogo className="h-3" />
          <p>
            Rapport généré le {formatDate(now)} à partir des données saisies par {parentName}
          </p>
        </div>
        <p className="mt-2 font-semibold text-foreground">{REPORT_DISCLAIMER}</p>
        {!isActive && <p className="mt-1">Généré gratuitement avec Tokō · toko.app</p>}
      </footer>
    </article>
  );
}
