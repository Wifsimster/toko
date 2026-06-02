import { Link } from "@tanstack/react-router";
import {
  Printer,
  ArrowLeft,
  Lock,
  MessageSquare,
  CalendarRange,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toISODate } from "@/lib/date";
import type { StatsPeriod, CustomDateRange } from "@/hooks/use-stats";
import type { UseMutationResult } from "@tanstack/react-query";
import type { BillingPlan } from "@/hooks/use-billing";

const PERIOD_OPTIONS_LOCAL: Array<{ value: StatsPeriod; label: string }> = [
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
  { value: "quarter", label: "90 jours" },
];

interface ReportControlsProps {
  isActive: boolean;
  period: StatsPeriod;
  setPeriod: (p: StatsPeriod) => void;
  customRange: CustomDateRange;
  setCustomRange: (updater: (r: CustomDateRange) => CustomDateRange) => void;
  now: Date;
  questions: string;
  setQuestions: (q: string) => void;
  emailTo: string;
  setEmailTo: (e: string) => void;
  emailSending: boolean;
  emailSent: boolean;
  pdfDownloading: boolean;
  showLockedHint: boolean;
  setShowLockedHint: (v: boolean) => void;
  onDownloadPdf: () => void;
  onSendEmail: () => void;
  checkout: UseMutationResult<{ url: string }, Error, BillingPlan | void, unknown>;
}

export function ReportControls({
  isActive,
  period,
  setPeriod,
  customRange,
  setCustomRange,
  now,
  questions,
  setQuestions,
  emailTo,
  setEmailTo,
  emailSending,
  emailSent,
  pdfDownloading,
  showLockedHint,
  setShowLockedHint,
  onDownloadPdf,
  onSendEmail,
  checkout,
}: ReportControlsProps) {
  return (
    <div className="report-controls mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Retour à mon compte
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Carnet de consultation TDAH
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isActive
              ? "Aperçu ci-dessous · imprimez ou enregistrez en PDF via votre navigateur."
              : "À apporter à votre prochain rendez-vous · imprimez ou enregistrez en PDF via votre navigateur."}
          </p>
        </div>
        <Button
          size="lg"
          onClick={isActive ? onDownloadPdf : () => window.print()}
          disabled={pdfDownloading}
          className="gap-2 shadow-sm self-start sm:self-auto"
        >
          <Printer className="size-4" />
          {pdfDownloading ? "Génération…" : "Télécharger en PDF"}
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
          {PERIOD_OPTIONS_LOCAL.map((opt) => {
            const locked = !isActive && opt.value === "quarter";
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={period === opt.value}
                onClick={() => {
                  if (locked) {
                    setShowLockedHint(true);
                    return;
                  }
                  setShowLockedHint(false);
                  setPeriod(opt.value);
                }}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors inline-flex items-center gap-1.5 " +
                  (period === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
                {locked && <Lock className="size-3" aria-hidden />}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={period === "custom"}
            onClick={() => {
              if (!isActive) {
                setShowLockedHint(true);
                return;
              }
              setShowLockedHint(false);
              setPeriod("custom");
            }}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors inline-flex items-center gap-1.5 " +
              (period === "custom"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            <CalendarRange className="size-3.5" />
            Personnalisé
            {!isActive && <Lock className="size-3" aria-hidden />}
          </button>
        </div>
      </div>

      {showLockedHint && !isActive && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-foreground">
            Période 90 jours et personnalisée, réservées au plan Famille
          </p>
          <p className="mt-1 text-muted-foreground">
            Suivez les tendances trimestrielles indispensables aux titrations
            et aux dossiers MDPH.
          </p>
          <Button
            size="sm"
            className="mt-2"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            Essayer Famille 14 jours gratuits
          </Button>
        </div>
      )}

      {/* Custom date range picker */}
      {period === "custom" && isActive && (
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
              max={toISODate(now)}
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
          <MessageSquare className="size-3.5" />
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

      {/* Email delivery, paid only */}
      {isActive ? (
        <div className="space-y-2">
          <Label
            htmlFor="report-email"
            className="flex items-center gap-1.5 text-sm"
          >
            <Send className="size-3.5" />
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
              onClick={onSendEmail}
              disabled={emailSending || !emailTo.trim() || emailSent}
              className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
            >
              <Send className="size-3.5" />
              {emailSent ? "Envoyé !" : emailSending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/80">
            Le rapport sera envoyé en pièce jointe HTML au médecin.
          </p>
        </div>
      ) : null}
    </div>
  );
}
