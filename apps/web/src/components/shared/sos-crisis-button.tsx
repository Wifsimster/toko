import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  HeartPulse,
  Sparkles,
  ArrowLeft,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrisisItems } from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

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
        className="pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-destructive text-white shadow-lg ring-4 ring-background transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95"
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

  // The page behind must disappear completely: a crisis screen with the tab
  // bar, the sidebar or scrolling content bleeding through is exactly the kind
  // of visual noise this screen exists to remove. Freezing the body scroll
  // also stops the page underneath from moving while the overlay is up.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Rendered at the document root rather than inside the floating-button
  // container: nested in that `z-40` stack the overlay could never paint above
  // the header, the tab bar or the sidebar. `z-[150]` stays below the idle
  // LockOverlay (`z-[200]`), which must always win.
  return createPortal(
    <dialog
      open
      aria-modal="true"
      aria-label={t("sos.dialogLabel")}
      className="pointer-events-auto fixed inset-0 z-[150] flex flex-col bg-background bg-gradient-to-b from-sage-50/70 via-background to-accent-50/60 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] dark:from-sage-900/40 dark:via-background dark:to-accent-900/30 m-0 h-full max-h-none w-full max-w-full border-none p-0"
    >
      <div className="flex shrink-0 items-center justify-between px-4 pt-4 sm:px-6">
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

      {/* Scrollable so the last card is never cut off on short screens, while
          short content stays optically centred (`m-auto`). */}
      <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-8 sm:px-6">
        <div className="m-auto flex w-full max-w-2xl flex-col items-center py-4">
          {technique === null && (
            <TechniqueChooser onSelect={onSelectTechnique} />
          )}
          {technique === "breathing" && <BreathingView />}
          {technique === "sensory" && <SensoryView />}
          {technique === "diversion" && <DiversionView onClose={onClose} />}
        </div>
      </div>
    </dialog>,
    document.body
  );
}

// Each technique is identified by a single coloured dot rather than a fully
// tinted card: the colour still tells the three options apart at a glance, but
// the surface stays neutral and the eye lands on the label first.
const TECHNIQUES: Array<{ key: Technique; dotClass: string }> = [
  {
    key: "breathing",
    dotClass: "bg-info-foreground ring-info-surface",
  },
  {
    key: "sensory",
    dotClass:
      "bg-sage-600 ring-sage-200/70 dark:bg-sage-300 dark:ring-sage-800/60",
  },
  {
    key: "diversion",
    dotClass:
      "bg-accent-500 ring-accent-200/70 dark:bg-accent-300 dark:ring-accent-800/60",
  },
];

function TechniqueChooser({
  onSelect,
}: {
  onSelect: (t: Technique) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="w-full space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("sos.title")}
        </h2>
        <p className="mx-auto max-w-md text-base text-muted-foreground sm:text-lg">
          {t("sos.subtitle")}
        </p>
      </div>
      <div className="grid gap-3">
        {TECHNIQUES.map(({ key, dotClass }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="group flex w-full items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 text-left shadow-xs transition-colors hover:border-border hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden="true"
              className={cn("mt-2 size-2.5 shrink-0 rounded-full ring-4", dotClass)}
            />
            <span className="min-w-0 flex-1 space-y-1">
              <span className="block font-heading text-lg font-semibold text-foreground">
                {t(`sos.techniques.${key}.title`)}
              </span>
              <span className="block text-sm leading-relaxed text-muted-foreground">
                {t(`sos.techniques.${key}.description`)}
              </span>
            </span>
            <ChevronRight
              className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
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
            key={step}
            className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage-100 font-heading text-sm font-semibold text-sage-700 dark:bg-sage-900/50 dark:text-sage-200">
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
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left shadow-xs"
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
