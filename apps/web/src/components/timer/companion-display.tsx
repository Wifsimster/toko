import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { type Critter } from "./critters";

export function CompanionDisplay({
  elapsedFraction,
  revealedCritter,
  abandonReveal,
  running,
  onOpenCollection,
}: {
  elapsedFraction: number;
  revealedCritter: Critter | null;
  abandonReveal: boolean;
  running: boolean;
  onOpenCollection: () => void;
}) {
  const { t } = useTranslation();

  if (revealedCritter) {
    return (
      <div
        className="flex flex-col items-center gap-1 animate-fade-in-up"
        aria-live="polite"
      >
        <button
          type="button"
          onClick={onOpenCollection}
          aria-label={t("timer.companion.openCollectionAria")}
          className="rounded-full text-5xl leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="block critter-float" aria-hidden="true">
            {revealedCritter.emoji}
          </span>
        </button>
        <span
          className={cn(
            "text-sm font-medium",
            abandonReveal ? "text-muted-foreground" : "text-primary"
          )}
        >
          {t(
            abandonReveal
              ? "timer.companion.tryAgain"
              : "timer.companion.hatched"
          )}
        </span>
        <button
          type="button"
          onClick={onOpenCollection}
          className="rounded text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t("timer.companion.viewCollection")}
        </button>
      </div>
    );
  }

  // Cracking egg: stays calm until past the halfway mark so a TDAH child
  // never feels rushed by the visual. The chick stays hidden inside — only
  // the wobble accelerates so the reveal at the end is the surprise.
  const cracking = running && elapsedFraction >= 0.4;
  // Shake ramps from a calm 1.4s cycle at 40 % elapsed down to ~0.25s when
  // the timer is about to ring, so it visibly speeds up near the end.
  const shakeIntensity = Math.max(0, Math.min(1, (elapsedFraction - 0.4) / 0.6));
  const shakeDurationSec = (1.4 - shakeIntensity * 1.15).toFixed(2);

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <span
        className={cn(
          "inline-block text-4xl select-none",
          cracking && "animate-egg-shake"
        )}
        style={
          cracking ? { animationDuration: `${shakeDurationSec}s` } : undefined
        }
      >
        🥚
      </span>
    </div>
  );
}
