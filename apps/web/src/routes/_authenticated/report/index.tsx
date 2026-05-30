import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useChildren } from "@/hooks/use-children";
import { useStats, type SymptomPoint, type StatsPeriod, type CustomDateRange } from "@/hooks/use-stats";
import { useJournal } from "@/hooks/use-journal";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useCrisisItems } from "@/hooks/use-crisis-list";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";
import { useUiStore } from "@/stores/ui-store";
import { getChildEmoji } from "@/lib/utils";
import { ArrowLeft, Users } from "lucide-react";
import { UpsellCard } from "./upsell-card";
import { ReportControls } from "./report-controls";
import { ReportDocument } from "./report-document";
import type { SymptomSummary, BarkleyProgress } from "./report-document";

export const Route = createFileRoute("/_authenticated/report/")({
  component: ReportPage,
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

/** Consolidates the 9 useState calls in ReportContent into one place. */
function useReportContentState(isActive: boolean, childId: string) {
  const storageKey = `toko-report-questions-${childId}`;
  // Free tier defaults to month; paid keeps quarter as the most clinically-useful window.
  const [period, setPeriod] = useState<StatsPeriod>(
    isActive ? "quarter" : "month"
  );
  const [customRange, setCustomRange] = useState<CustomDateRange>(() => {
    const to = new Date().toISOString().split("T")[0]!;
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    return { from, to };
  });
  const [now] = useState(() => new Date());
  // Load saved questions from localStorage on first mount via lazy initializer.
  const [questions, setQuestions] = useState<string>(
    () => localStorage.getItem(storageKey) ?? ""
  );
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [showLockedHint, setShowLockedHint] = useState(false);

  // Persist questions to localStorage whenever they change.
  useEffect(() => {
    if (questions) {
      localStorage.setItem(storageKey, questions);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [questions, storageKey]);

  return {
    period, setPeriod,
    customRange, setCustomRange,
    now,
    questions, setQuestions,
    emailTo, setEmailTo,
    emailSending, setEmailSending,
    emailSent, setEmailSent,
    pdfDownloading, setPdfDownloading,
    showLockedHint, setShowLockedHint,
  };
}

function ReportPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const billing = useBillingStatus();
  const isActive = billing.data?.active ?? false;
  const { data: allChildren } = useChildren();
  const [multiChild, setMultiChild] = useState(false);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  const handleEnableMultiChild = () => {
    setMultiChild(true);
    if (allChildren) {
      setSelectedChildIds(allChildren.map((c) => c.id));
    }
  };

  if (billing.isLoading) return <PageLoader />;

  // Multi-child mode is paid-only; force back to single view if a previously
  // paid user lapses while on this screen.
  const inMultiChild = multiChild && isActive;
  const hasMultipleChildren = (allChildren?.length ?? 0) > 1;

  if (!inMultiChild) {
    if (!activeChildId) {
      return (
        <div className="mx-auto max-w-2xl">
          <p className="text-muted-foreground">
            Sélectionnez un enfant pour générer son carnet de consultation.
          </p>
        </div>
      );
    }

    return (
      <div>
        {isActive && hasMultipleChildren && (
          <div className="mx-auto mb-4 max-w-3xl">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableMultiChild}
              className="gap-1.5"
            >
              <Users className="size-3.5" />
              Rapport consolidé ({allChildren?.length} enfants)
            </Button>
          </div>
        )}
        <ReportContent childId={activeChildId} isActive={isActive} />
      </div>
    );
  }

  // Multi-child consolidated mode (paid only)
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
              <ArrowLeft className="size-3.5" />
              Carnet individuel
            </Button>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
              Carnet de consultation TDAH, consolidé
            </h1>
          </div>
          <Button
            size="lg"
            onClick={() => window.print()}
            className="gap-2 shadow-sm"
          >
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
          <ReportContent childId={childId} isActive={isActive} />
        </div>
      ))}
    </div>
  );
}

function ReportContent({ childId, isActive }: { childId: string; isActive: boolean }) {
  const checkout = useCheckout();
  const state = useReportContentState(isActive, childId);
  const {
    period, setPeriod,
    customRange, setCustomRange,
    now,
    questions, setQuestions,
    emailTo, setEmailTo,
    emailSending, setEmailSending,
    emailSent, setEmailSent,
    pdfDownloading, setPdfDownloading,
    showLockedHint, setShowLockedHint,
  } = state;

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

  const symptomSummaries = useMemo((): SymptomSummary[] => {
    if (!stats?.symptoms) return [];
    const keys = Object.keys(symptomLabels) as Array<keyof Omit<SymptomPoint, "date">>;
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
    const endMs = periodEnd.getTime() + 24 * 60 * 60 * 1000;
    return [...journal]
      .filter((e) => {
        const ms = new Date(e.date).getTime();
        return ms >= startMs && ms <= endMs;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  const barkleyProgress = useMemo((): BarkleyProgress | null => {
    if (!barkleySteps || barkleySteps.length === 0) return null;
    const completed = [...barkleySteps]
      .filter((s) => s.completedAt)
      .sort((a, b) => a.stepNumber - b.stepNumber);
    const maxCompleted = completed.length > 0 ? Math.max(...completed.map((s) => s.stepNumber)) : 0;
    return { completed, currentStep: maxCompleted + 1, total: 10 };
  }, [barkleySteps]);

  const handleDownloadPdf = async () => {
    if (!child) return;
    setPdfDownloading(true);
    try {
      const response = await fetch("/api/report/pdf", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          period: period === "custom" ? undefined : period,
          from: period === "custom" ? customRange.from : undefined,
          to: period === "custom" ? customRange.to : undefined,
          questions: questions.trim() || undefined,
        }),
      });
      if (!response.ok) {
        window.print();
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toko-rapport-${child.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.print();
    } finally {
      setPdfDownloading(false);
    }
  };

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
      // silently fail, user can retry
    } finally {
      setEmailSending(false);
    }
  };

  if (statsLoading || journalLoading) return <PageLoader />;

  return (
    <div className="report-page mx-auto max-w-3xl">
      <ReportControls
        isActive={isActive}
        period={period}
        setPeriod={setPeriod}
        customRange={customRange}
        setCustomRange={setCustomRange}
        now={now}
        questions={questions}
        setQuestions={setQuestions}
        emailTo={emailTo}
        setEmailTo={setEmailTo}
        emailSending={emailSending}
        emailSent={emailSent}
        pdfDownloading={pdfDownloading}
        showLockedHint={showLockedHint}
        setShowLockedHint={setShowLockedHint}
        onDownloadPdf={handleDownloadPdf}
        onSendEmail={handleSendEmail}
        checkout={checkout}
      />
      <ReportDocument
        child={child}
        isActive={isActive}
        periodLabel={periodConfig.label}
        periodStart={periodStart}
        now={now}
        questions={questions}
        stats={stats}
        symptomSummaries={symptomSummaries}
        journalHighlights={journalHighlights}
        crisisCount={crisisCount}
        victoryCount={victoryCount}
        barkleyProgress={barkleyProgress}
        crisisItems={crisisItems}
      />
      {!isActive && <UpsellCard />}
    </div>
  );
}
