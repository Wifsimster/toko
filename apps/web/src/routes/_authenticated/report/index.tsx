import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useChildren } from "@/hooks/use-children";
import { useStats, type StatsPeriod, type CustomDateRange } from "@/hooks/use-stats";
import { useJournal } from "@/hooks/use-journal";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useCrisisItems } from "@/hooks/use-crisis-list";
import { useMedications } from "@/hooks/use-medications";
import { useSession } from "@/lib/auth-client";
import {
  REPORT_DIMENSIONS,
  REPORT_DIMENSION_LABELS,
  reportDimensionTrend,
  reportDimensionValues,
  reportTrendView,
} from "@focusflow/validators";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { parseISODate, toISODate } from "@/lib/date";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";
import { useUiStore } from "@/stores/ui-store";
import { ArrowLeft, Users } from "lucide-react";
import { UpsellCard } from "./upsell-card";
import { ReportControls } from "./report-controls";
import { ReportDocument } from "./report-document";
import type { SymptomSummary } from "./report-document";

export const Route = createFileRoute("/_authenticated/report/")({
  component: ReportPage,
  staticData: {
    crumb: "nav.report",
  },
});

const PERIOD_OPTIONS: Array<{ value: StatsPeriod; label: string; days: number }> = [
  { value: "week", label: "7 jours", days: 7 },
  { value: "month", label: "30 jours", days: 30 },
  { value: "quarter", label: "90 jours", days: 90 },
];

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function useReportContentState(isActive: boolean, childId: string) {
  const storageKey = `toko-report-questions-${childId}`;
  const [period, setPeriod] = useState<StatsPeriod>(
    isActive ? "quarter" : "month"
  );
  const [customRange, setCustomRange] = useState<CustomDateRange>(() => {
    const to = toISODate(new Date());
    const from = toISODate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return { from, to };
  });
  const [now] = useState(() => new Date());
  const [questions, setQuestions] = useState<string>(
    () => {
      try {
        return localStorage.getItem(storageKey) ?? "";
      } catch {
        return "";
      }
    }
  );
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [showLockedHint, setShowLockedHint] = useState(false);

  useEffect(() => {
    try {
      if (questions) {
        localStorage.setItem(storageKey, questions);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
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
        <ReportContent
          key={activeChildId}
          childId={activeChildId}
          isActive={isActive}
        />
      </div>
    );
  }

  const toggleChild = (id: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="report-controls mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMultiChild(false)}
              className="gap-1.5 -ml-2"
            >
              <ArrowLeft className="size-3.5" />
              Carnet individuel
            </Button>
            <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">
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
                  ? "border-primary bg-brand/10 text-brand-strong"
                  : "border-border/60 text-muted-foreground hover:text-foreground")
              }
            >
              {child.name}
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
  const { data: medications } = useMedications(childId);
  const { data: session } = useSession();
  const parentName = session?.user?.name || "Parent";

  const child = children?.find((c) => c.id === childId);
  const periodConfig = period === "custom"
    ? { value: "custom" as const, label: "Personnalisé", days: Math.max(1, Math.ceil((new Date(customRange.to).getTime() - new Date(customRange.from).getTime()) / (24 * 60 * 60 * 1000))) }
    : PERIOD_OPTIONS.find((p) => p.value === period)!;

  const symptomSummaries = useMemo((): SymptomSummary[] => {
    if (!stats?.symptoms) return [];
    return REPORT_DIMENSIONS.map((key) => {
      const values = reportDimensionValues(stats.symptoms, key);
      return {
        key,
        label: REPORT_DIMENSION_LABELS[key],
        average: average(values),
        trend: reportTrendView(reportDimensionTrend(stats.symptoms, key)),
        samples: values.length,
      };
    });
  }, [stats]);

  const trackedDays = useMemo(
    () => new Set((stats?.symptoms ?? []).map((p) => p.date)).size,
    [stats],
  );

  const periodStart = useMemo(() => {
    if (period === "custom") return parseISODate(customRange.from);
    const d = new Date();
    d.setDate(d.getDate() - periodConfig.days);
    return d;
  }, [period, customRange.from, periodConfig.days]);

  const periodEnd = useMemo(() => {
    if (period === "custom") return parseISODate(customRange.to);
    return new Date();
  }, [period, customRange.to]);

  const journalInPeriod = useMemo(() => {
    if (!journal) return [];
    const startMs = periodStart.getTime();
    const endMs = periodEnd.getTime() + 24 * 60 * 60 * 1000;
    return [...journal]
      .filter((e) => {
        const ms = parseISODate(e.date).getTime();
        return ms >= startMs && ms <= endMs;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journal, periodStart, periodEnd]);

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
      toast.error(i18n.t("toastErrors.sendReportEmail"));
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
        childId={childId}
        child={child}
        isActive={isActive}
        parentName={parentName}
        periodStart={periodStart}
        periodEnd={periodEnd}
        now={now}
        questions={questions}
        trackedDays={trackedDays}
        symptomSummaries={symptomSummaries}
        journalEntries={journalInPeriod}
        barkleySteps={barkleySteps}
        crisisItems={crisisItems}
        medications={medications}
      />
      {!isActive && (
        <div className="print:hidden">
          <UpsellCard />
        </div>
      )}
    </div>
  );
}
