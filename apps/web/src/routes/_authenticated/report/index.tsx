import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Printer, Sparkles, ArrowLeft, Lock, MessageSquare, CalendarRange, Send, Star, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/page-loader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useChildren } from "@/hooks/use-children";
import { useStats, type SymptomPoint, type StatsPeriod, type CustomDateRange } from "@/hooks/use-stats";
import { useJournal } from "@/hooks/use-journal";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useCrisisItems } from "@/hooks/use-crisis-list";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";
import { useUiStore } from "@/stores/ui-store";
import { formatChildAge, getChildEmoji } from "@/lib/utils";
import { tagConfig } from "@/components/journal/journal-card";
import type { JournalTag } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/report/")({
  component: ReportPage,
  staticData: { crumb: "nav.report" },
});

const symptomLabels: Record<keyof Omit<SymptomPoint, "date">, string> = {
  mood: "Humeur",
  focus: "Concentration",
  agitation: "Agitation",
  impulse: "Impulsivité",
  sleep: "Sommeil",
};

const PERIOD_OPTIONS: Array<{ value: StatsPeriod; label: string; days: number }> = [
  { value: "week", label: "7 jours", days: 7 },
  { value: "month", label: "30 jours", days: 30 },
  { value: "quarter", label: "90 jours", days: 90 },
];

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function trend(values: number[]): "up" | "down" | "stable" | null {
  if (values.length < 4) return null;
  const half = Math.floor(values.length / 2);
  const firstHalf = average(values.slice(0, half));
  const secondHalf = average(values.slice(half));
  if (firstHalf === null || secondHalf === null) return null;
  const diff = secondHalf - firstHalf;
  if (Math.abs(diff) < 0.3) return "stable";
  return diff > 0 ? "up" : "down";
}

function trendLabel(t: "up" | "down" | "stable" | null): string {
  if (t === "up") return "↗ en progression";
  if (t === "down") return "↘ en baisse";
  if (t === "stable") return "→ stable";
  return "—";
}

/**
 * Minimal SVG sparkline. No dependencies.
 * Values expected in 1-5 range (symptom scale).
 */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <span className="text-xs text-muted-foreground/60">—</span>;
  }
  const width = 80;
  const height = 20;
  const min = 1;
  const max = 5;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline inline-block align-middle"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ReportPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const billing = useBillingStatus();
  const isActive = billing.data?.active ?? false;
  const { data: allChildren } = useChildren();
  const [multiChild, setMultiChild] = useState(false);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  // Sync selected children when toggling multi-child mode
  useEffect(() => {
    if (multiChild && allChildren) {
      setSelectedChildIds(allChildren.map((c) => c.id));
    }
  }, [multiChild, allChildren]);

  if (billing.isLoading) return <PageLoader />;

  if (!isActive) {
    return <PaywallView />;
  }

  const hasMultipleChildren = (allChildren?.length ?? 0) > 1;

  if (!multiChild) {
    if (!activeChildId) {
      return (
        <div className="mx-auto max-w-2xl">
          <p className="text-muted-foreground">
            Sélectionnez un enfant pour générer son rapport médical.
          </p>
        </div>
      );
    }

    return (
      <div>
        {hasMultipleChildren && (
          <div className="mx-auto mb-4 max-w-3xl">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMultiChild(true)}
              className="gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              Rapport consolidé ({allChildren?.length} enfants)
            </Button>
          </div>
        )}
        <ReportContent childId={activeChildId} />
      </div>
    );
  }

  // Multi-child consolidated mode
  const toggleChild = (id: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="report-controls mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMultiChild(false)}
              className="gap-1.5 -ml-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Rapport individuel
            </Button>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
              Rapport consolidé
            </h1>
          </div>
          <Button
            size="lg"
            onClick={() => window.print()}
            className="gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Télécharger en PDF
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allChildren?.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => toggleChild(child.id)}
              className={
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors " +
                (selectedChildIds.includes(child.id)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground")
              }
            >
              {getChildEmoji(child.gender)} {child.name}
            </button>
          ))}
        </div>
      </div>
      {selectedChildIds.map((childId) => (
        <div key={childId} className="mb-12">
          <ReportContent childId={childId} />
        </div>
      ))}
    </div>
  );
}

function PaywallView() {
  const checkout = useCheckout();
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à mon compte
      </Link>
      <Card className="mt-6 border-primary/20 bg-gradient-to-br from-accent/10 to-transparent">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Rapport médical — fonctionnalité Famille
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Générez un rapport PDF synthétique à apporter en consultation chez
            le pédopsychiatre ou le pédiatre : tendances, journal,
            déclencheurs de crise — tout ce qui rend une consultation utile.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Période au choix (7, 30 ou 90 jours)</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Courbes d'évolution pour les 7 dimensions</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Vos questions au médecin intégrées en en-tête</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Export PDF prêt à imprimer ou partager</span>
            </li>
          </ul>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 shadow-sm"
              onClick={() => checkout.mutate()}
              disabled={checkout.isPending}
            >
              Essayer Famille 14 jours gratuits
            </Button>
            <Link to="/ressources">
              <Button variant="outline" size="lg">
                Lire les ressources gratuites
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/80">
            Sans carte bancaire pendant l'essai · Annulable en 1 clic
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportContent({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatsPeriod>("quarter");
  const [customRange, setCustomRange] = useState<CustomDateRange>(() => {
    const to = new Date().toISOString().split("T")[0]!;
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    return { from, to };
  });
  const [questions, setQuestions] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Persist annotations per-child in localStorage
  const storageKey = `toko-report-questions-${childId}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setQuestions(saved);
  }, [storageKey]);
  useEffect(() => {
    if (questions) {
      localStorage.setItem(storageKey, questions);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [questions, storageKey]);

  const { data: children } = useChildren();
  const { data: stats, isLoading: statsLoading } = useStats(
    childId,
    period,
    period === "custom" ? customRange : undefined
  );
  const { data: journal, isLoading: journalLoading } = useJournal(childId);
  const { data: barkleySteps } = useBarkleySteps(childId);
  const { data: crisisItems } = useCrisisItems(childId);

  const child = children?.find((c) => c.id === childId);
  const periodConfig = period === "custom"
    ? { value: "custom" as const, label: "Personnalisé", days: Math.max(1, Math.ceil((new Date(customRange.to).getTime() - new Date(customRange.from).getTime()) / (24 * 60 * 60 * 1000))) }
    : PERIOD_OPTIONS.find((p) => p.value === period)!;

  const symptomSummaries = useMemo(() => {
    if (!stats?.symptoms) return [];
    const keys = Object.keys(symptomLabels) as Array<
      keyof Omit<SymptomPoint, "date">
    >;
    return keys.map((key) => {
      const values = stats.symptoms
        .map((p) => p[key])
        .filter((v): v is number => typeof v === "number" && v > 0);
      return {
        key,
        label: symptomLabels[key],
        average: average(values),
        trend: trend(values),
        samples: values.length,
        series: values,
      };
    });
  }, [stats]);

  // Journal entries filtered to the selected period
  const periodStart = useMemo(() => {
    if (period === "custom") return new Date(customRange.from);
    const d = new Date();
    d.setDate(d.getDate() - periodConfig.days);
    return d;
  }, [period, customRange.from, periodConfig.days]);

  const periodEnd = useMemo(() => {
    if (period === "custom") return new Date(customRange.to);
    return new Date();
  }, [period, customRange.to]);

  const journalHighlights = useMemo(() => {
    if (!journal) return [];
    const startMs = periodStart.getTime();
    const endMs = periodEnd.getTime() + 24 * 60 * 60 * 1000; // include end day
    return [...journal]
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= startMs && t <= endMs;
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 10);
  }, [journal, periodStart, periodEnd]);

  const crisisCount = useMemo(
    () => journalHighlights.filter((e) => e.tags?.includes("crisis")).length,
    [journalHighlights]
  );
  const victoryCount = useMemo(
    () => journalHighlights.filter((e) => e.tags?.includes("victory")).length,
    [journalHighlights]
  );

  // Barkley progress: completed steps sorted by number
  const barkleyProgress = useMemo(() => {
    if (!barkleySteps || barkleySteps.length === 0) return null;
    const completed = [...barkleySteps]
      .filter((s) => s.completedAt)
      .sort((a, b) => a.stepNumber - b.stepNumber);
    const maxCompleted = completed.length > 0 ? Math.max(...completed.map((s) => s.stepNumber)) : 0;
    return { completed, currentStep: maxCompleted + 1, total: 10 };
  }, [barkleySteps]);

  // Email send handler
  const handleSendEmail = async () => {
    if (!emailTo.trim() || !child) return;
    setEmailSending(true);
    try {
      await import("@/lib/api-client").then(({ api }) =>
        api.post("/report/send-email", {
          childId,
          recipientEmail: emailTo.trim(),
          period: period === "custom" ? undefined : period,
          from: period === "custom" ? customRange.from : undefined,
          to: period === "custom" ? customRange.to : undefined,
          questions: questions.trim() || undefined,
        })
      );
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch {
      // silently fail — user can retry
    } finally {
      setEmailSending(false);
    }
  };

  if (statsLoading || journalLoading) return <PageLoader />;

  const now = new Date();

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="report-page mx-auto max-w-3xl">
      {/* Print controls (hidden when printing) */}
      <div className="report-controls mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à mon compte
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Rapport médical
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aperçu ci-dessous · imprimez ou enregistrez en PDF via votre
              navigateur.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => window.print()}
            className="gap-2 shadow-sm self-start sm:self-auto"
          >
            <Printer className="h-4 w-4" />
            Télécharger en PDF
          </Button>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Période :
          </span>
          <div
            role="tablist"
            aria-label="Sélection de la période du rapport"
            className="inline-flex rounded-lg border border-border/60 bg-background p-0.5 shadow-sm"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={period === opt.value}
                onClick={() => setPeriod(opt.value)}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                  (period === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              role="tab"
              aria-selected={period === "custom"}
              onClick={() => setPeriod("custom")}
              className={
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors inline-flex items-center gap-1.5 " +
                (period === "custom"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Personnalisé
            </button>
          </div>
        </div>

        {/* Custom date range picker */}
        {period === "custom" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="report-from" className="text-sm whitespace-nowrap">Du</Label>
              <Input
                id="report-from"
                type="date"
                value={customRange.from}
                max={customRange.to}
                onChange={(e) => setCustomRange((r) => ({ ...r, from: e.target.value }))}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="report-to" className="text-sm whitespace-nowrap">au</Label>
              <Input
                id="report-to"
                type="date"
                value={customRange.to}
                min={customRange.from}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCustomRange((r) => ({ ...r, to: e.target.value }))}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        )}

        {/* Annotations / questions au médecin */}
        <div className="space-y-2">
          <Label
            htmlFor="report-questions"
            className="flex items-center gap-1.5 text-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Vos questions au médecin
            <span className="text-xs font-normal text-muted-foreground">
              (apparaîtront en en-tête du PDF)
            </span>
          </Label>
          <Textarea
            id="report-questions"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            placeholder="Ex. Les crises du soir se multiplient depuis 3 semaines. Faut-il ajuster le traitement ?"
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground/80">
            Sauvegardé automatiquement dans votre navigateur, pour cet enfant.
          </p>
        </div>

        {/* Email delivery */}
        <div className="space-y-2">
          <Label
            htmlFor="report-email"
            className="flex items-center gap-1.5 text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            Envoyer par email au médecin
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="report-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="docteur@cabinet-medical.fr"
              className="w-full sm:max-w-xs"
            />
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={emailSending || !emailTo.trim() || emailSent}
              className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
            >
              <Send className="h-3.5 w-3.5" />
              {emailSent ? "Envoyé !" : emailSending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/80">
            Le rapport sera envoyé en pièce jointe HTML au médecin.
          </p>
        </div>
      </div>

      {/* Printable document */}
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
                {child?.birthDate && (
                  <span>· {formatChildAge(child.birthDate)}</span>
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
            Synthèse de la période ({periodConfig.label})
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
                <Star className="h-4 w-4" />
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
                          — {formatDate(step.completedAt)}
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
                <ShieldAlert className="h-4 w-4" />
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
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
          <p className="mt-1">Tokō · toko.app</p>
        </footer>
      </article>
    </div>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="font-heading text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
