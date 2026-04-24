import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";
import { Lightbulb, X, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUiStore } from "@/stores/ui-store";
import {
  getTipsByFeature,
  type Tip,
  type TipFeature,
} from "@/lib/tips-registry";

const ROUTE_TO_FEATURE: Array<[string, TipFeature]> = [
  ["/dashboard", "dashboard"],
  ["/symptoms", "symptoms"],
  ["/journal", "journal"],
  ["/crisis-list", "crisis-list"],
  ["/rewards", "rewards"],
  ["/barkley", "barkley"],
];

function featureFromPath(pathname: string): TipFeature | null {
  const match = ROUTE_TO_FEATURE.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : null;
}

export function FloatingTipButton() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const feature = featureFromPath(pathname);
  const dismissedTips = useUiStore((s) => s.dismissedTips);
  const dismissTip = useUiStore((s) => s.dismissTip);
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);

  const available = useMemo<Tip[]>(() => {
    if (!feature) return [];
    return getTipsByFeature(feature).filter(
      (tip) => !dismissedTips.includes(tip.id)
    );
  }, [feature, dismissedTips]);

  if (!feature || available.length === 0) return null;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const tip = available[(dayOfYear + offset) % available.length]!;
  const showNext = available.length > 1;

  return (
    <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 lg:bottom-6 lg:right-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={t("featureTip.open")}
              className="pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full bg-info-surface text-info-foreground shadow-md ring-1 ring-info-border transition-transform duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95"
            >
              {!open && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-info-foreground/30 animate-tip-halo"
                />
              )}
              <Lightbulb
                className={`relative h-[1.125rem] w-[1.125rem] ${
                  open ? "" : "animate-tip-wiggle"
                }`}
              />
            </button>
          }
        />
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))] border border-info-border bg-[color-mix(in_oklab,#3b82f6_14%,var(--color-popover))] text-info-foreground shadow-md dark:bg-[color-mix(in_oklab,#3b82f6_22%,var(--color-popover))]"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-xs leading-relaxed">
              {t(`tips.${tip.id}`)}
            </p>
          </div>
          <div className="flex items-center justify-end gap-1 pt-1">
            {showNext && (
              <button
                type="button"
                onClick={() => setOffset((o) => o + 1)}
                aria-label={t("featureTip.next")}
                className="flex h-7 items-center gap-1 rounded px-2 text-xs text-info-foreground/80 hover:text-info-foreground focus-visible:text-info-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span>{t("featureTip.next")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                dismissTip(tip.id);
                setOffset(0);
              }}
              aria-label={t("featureTip.dismiss")}
              className="flex h-7 w-7 items-center justify-center rounded text-info-foreground/70 hover:text-info-foreground focus-visible:text-info-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
