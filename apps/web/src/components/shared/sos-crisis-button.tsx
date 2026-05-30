import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  HeartPulse,
  Wind,
  VolumeX,
  Sparkles,
  ArrowLeft,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrisisItems } from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";

type Technique = "breathing" | "sensory" | "diversion";

const BREATH_PHASES = ["inhale", "hold", "exhale", "pause"] as const;
type BreathPhase = (typeof BREATH_PHASES)[number];
const PHASE_DURATION_MS = 4000;

export function SOSCrisisButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [technique, setTechnique] = useState<Technique | null>(null);

  // Reset to chooser when overlay closes so reopening starts fresh.
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => setTechnique(null), 250);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Escape closes the overlay (or backs out of an active technique).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (technique) setTechnique(null);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, technique]);

  return (
    <>
      <button
        type="button"
        data-tour="sos"
        onClick={() => setOpen(true)}
        aria-label={t("sos.openLabel")}
        title={t("sos.buttonLabel")}
        className="pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-destructive text-white shadow-lg ring-2 ring-destructive/20 transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-destructive/40 animate-tip-halo"
        />
        <HeartPulse className="size-6" aria-hidden="true" />
      </button>

      {open && (
        <SOSOverlay
          technique={technique}
          onSelectTechnique={setTechnique}
          onBack={() => setTechnique(null)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SOSOverlay({
  technique,
  onSelectTechnique,
  onBack,
  onClose,
}: {
  technique: Technique | null;
  onSelectTechnique: (t: Technique) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("sos.dialogLabel")}
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-background bg-gradient-to-b from-sage-50 via-background to-accent-50 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] dark:from-sage-900 dark:via-background dark:to-accent-900"
    >
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6">
        {technique ? (
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("sos.back")}
          </Button>
        ) : (
          <span aria-hidden="true" className="size-9" />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("sos.close")}
          className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        {technique === null && (
          <TechniqueChooser onSelect={onSelectTechnique} />
        )}
        {technique === "breathing" && <BreathingView />}
        {technique === "sensory" && <SensoryView />}
        {technique === "diversion" && <DiversionView onClose={onClose} />}
      </div>
    </div>
  );
}

const TECHNIQUES: Array<{
  key: Technique;
  icon: typeof Wind;
  toneClass: string;
}> = [
  {
    key: "breathing",
    icon: Wind,
    toneClass:
      "bg-info-surface text-info-foreground ring-info-border hover:bg-info-surface/70",
  },
  {
    key: "sensory",
    icon: VolumeX,
    toneClass:
      "bg-sage-100 text-sage-800 ring-sage-200 hover:bg-sage-100/70 dark:bg-sage-900/40 dark:text-sage-100 dark:ring-sage-800",
  },
  {
    key: "diversion",
    icon: Sparkles,
    toneClass:
      "bg-accent-100 text-accent-900 ring-accent-200 hover:bg-accent-100/70 dark:bg-accent-900/40 dark:text-accent-100 dark:ring-accent-800",
  },
];

function TechniqueChooser({
  onSelect,
}: {
  onSelect: (t: Technique) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("sos.title")}
        </h2>
        <p className="mx-auto max-w-md text-base text-muted-foreground sm:text-lg">
          {t("sos.subtitle")}
        </p>
      </div>
      <div className="grid gap-3 sm:gap-4">
        {TECHNIQUES.map(({ key, icon: Icon, toneClass }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left ring-1 transition-all hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${toneClass}`}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/60">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <span className="flex-1 space-y-1">
              <span className="block font-heading text-lg font-semibold">
                {t(`sos.techniques.${key}.title`)}
              </span>
              <span className="block text-sm opacity-80">
                {t(`sos.techniques.${key}.description`)}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 opacity-60" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BreathingView() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const id = setInterval(() => {
      const i = BREATH_PHASES.indexOf(phaseRef.current);
      const next = BREATH_PHASES[(i + 1) % BREATH_PHASES.length]!;
      setPhase(next);
    }, PHASE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
        {t("sos.breathing.title")}
      </h2>
      <div
        className="relative flex size-56 items-center justify-center sm:h-72 sm:w-72"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-info-surface/40 ring-2 ring-info-border animate-sos-breathe"
        />
        <span className="relative text-2xl font-semibold text-foreground sm:text-3xl">
          {t(`sos.breathing.phases.${phase}`)}
        </span>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {t("sos.breathing.intro")}
      </p>
    </div>
  );
}

function SensoryView() {
  const { t } = useTranslation();
  const steps = t("sos.sensory.steps", { returnObjects: true }) as string[];
  return (
    <div className="w-full max-w-xl space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          {t("sos.sensory.title")}
        </h2>
        <p className="text-base text-muted-foreground">
          {t("sos.sensory.intro")}
        </p>
      </div>
      <ol className="space-y-3 text-left">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-2xl bg-sage-100/60 p-4 ring-1 ring-sage-200 dark:bg-sage-900/30 dark:ring-sage-800"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background font-heading text-sm font-semibold text-sage-700 dark:text-sage-200">
              {i + 1}
            </span>
            <p className="text-base leading-relaxed text-foreground">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DiversionView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: customItems } = useCrisisItems(activeChildId ?? "");
  const fallbackIdeas = t("sos.diversion.ideas", { returnObjects: true }) as Array<{
    emoji: string;
    label: string;
  }>;

  // Prefer the parent's curated list — these activities they already
  // know calm THIS child. Fall back to evergreen defaults when there
  // isn't one yet (or no active child selected). Fetching is live, so
  // adding an item in /crisis-list reflects on the next SOS open.
  const usingCustom = !!customItems && customItems.length > 0;
  const items = usingCustom
    ? customItems.map((c) => ({
        key: c.id,
        emoji: c.emoji || "💙",
        label: c.label,
      }))
    : fallbackIdeas.map((i) => ({ key: i.label, ...i }));

  return (
    <div className="w-full max-w-xl space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          {t("sos.diversion.title")}
        </h2>
        <p className="text-base text-muted-foreground">
          {usingCustom
            ? t("sos.diversion.introCustom")
            : t("sos.diversion.intro")}
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 rounded-2xl bg-accent-100/60 p-4 text-left ring-1 ring-accent-200 dark:bg-accent-900/30 dark:ring-accent-800"
          >
            <span className="text-2xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-base font-medium text-foreground">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <Link to="/crisis-list" onClick={onClose}>
        <Button variant="outline" className="gap-2">
          <Sparkles className="size-4" />
          {usingCustom
            ? t("sos.diversion.editMyList")
            : t("sos.diversion.viewMyList")}
        </Button>
      </Link>
    </div>
  );
}
