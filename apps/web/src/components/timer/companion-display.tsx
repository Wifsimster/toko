import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Companion, Picto } from "@/components/mo/companion";
import { type Critter } from "./critters";

function eggStage(remaining: number) {
  if (remaining > 0.75) return "oeuf-0" as const;
  if (remaining > 0.5) return "oeuf-1" as const;
  if (remaining > 0.25) return "oeuf-2" as const;
  return "oeuf-3" as const;
}

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
          className="rounded-full leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="block critter-float" aria-hidden="true">
            <Companion id={revealedCritter.id} size={80} />
          </span>
        </button>
        <span
          className={cn(
            "text-sm font-medium",
            abandonReveal ? "text-muted-foreground" : "text-brand-strong"
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

  const cracking = running && elapsedFraction >= 0.4;
  const shakeIntensity = Math.max(0, Math.min(1, (elapsedFraction - 0.4) / 0.6));
  const shakeDurationSec = (1.4 - shakeIntensity * 1.15).toFixed(2);

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <span
        className={cn(
          "inline-block select-none",
          cracking && "animate-egg-shake"
        )}
        style={
          cracking ? { animationDuration: `${shakeDurationSec}s` } : undefined
        }
      >
        <Picto name={eggStage(1 - elapsedFraction)} size={56} />
      </span>
    </div>
  );
}
