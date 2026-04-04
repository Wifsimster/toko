import { useMemo, useState } from "react";
import { Lightbulb, X, ChevronRight } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { getTipsByFeature, type TipFeature, type Tip } from "@/lib/tips-registry";

/**
 * Displays a single discreet, dismissible tip for the given feature.
 *
 * Shows one tip at a time (deterministic pick based on feature + day of year,
 * so the same tip is shown all day but rotates daily). A "next" button lets
 * parents browse other tips without dismissing. The close button permanently
 * dismisses the current tip (persisted via ui-store).
 */
export function FeatureTip({ feature }: { feature: TipFeature }) {
  const dismissedTips = useUiStore((s) => s.dismissedTips);
  const dismissTip = useUiStore((s) => s.dismissTip);
  const [offset, setOffset] = useState(0);

  const available = useMemo<Tip[]>(
    () => getTipsByFeature(feature).filter((t) => !dismissedTips.includes(t.id)),
    [feature, dismissedTips]
  );

  if (available.length === 0) return null;

  // Rotate daily: deterministic index based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const tip = available[(dayOfYear + offset) % available.length]!;

  const showNext = available.length > 1;

  return (
    <div
      role="note"
      aria-label="Conseil"
      className="group flex items-start gap-2 rounded-lg border border-indigo-200/40 bg-indigo-50/50 px-3 py-2 text-xs text-muted-foreground dark:border-indigo-800/30 dark:bg-indigo-950/20"
    >
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
      <p className="flex-1 leading-relaxed">{tip.content}</p>
      <div className="flex shrink-0 items-center gap-0.5">
        {showNext && (
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Conseil suivant"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/60 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            dismissTip(tip.id);
            setOffset(0);
          }}
          aria-label="Masquer ce conseil"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/60 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
