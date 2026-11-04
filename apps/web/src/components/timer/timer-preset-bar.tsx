import { useTranslation } from "react-i18next";
import { Zap, Egg, EggOff, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function TimerPresetBar({
  durationSec,
  speedUp,
  companionEnabled,
  childId,
  onSetMinutes,
  onSetSeconds,
  onToggleSpeedUp,
  onToggleCompanion,
  onOpenCollection,
  presetMinutes,
  presetSpeedupSeconds,
}: {
  durationSec: number;
  speedUp: boolean;
  companionEnabled: boolean;
  childId?: string;
  onSetMinutes: (m: number) => void;
  onSetSeconds: (s: number) => void;
  onToggleSpeedUp: () => void;
  onToggleCompanion: () => void;
  onOpenCollection: () => void;
  presetMinutes: readonly number[];
  presetSpeedupSeconds: readonly number[];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div
        role="radiogroup"
        aria-label={t("timer.durationLabel")}
        className="flex w-full max-w-sm rounded-full bg-muted p-1"
      >
        {(speedUp ? presetSpeedupSeconds : presetMinutes.map((m) => m * 60)).map((sec) => {
          const active = durationSec === sec;
          const label =
            speedUp && sec < 60 ? t("timer.seconds", { count: sec }) : t("timer.minutes", { count: sec / 60 });
          return (
            <button
              key={sec}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => (speedUp ? onSetSeconds(sec) : onSetMinutes(sec / 60))}
              className={cn(
                "min-h-11 flex-1 rounded-full text-[0.9375rem] font-semibold tabular-nums text-muted-foreground transition-colors",
                active && "bg-card text-foreground shadow-xs"
              )}
            >
              {speedUp && sec < 60 ? sec : sec / 60}
            </button>
          );
        })}
      </div>
      <p aria-hidden="true" className="-mt-1 text-xs text-muted-foreground">
        {speedUp ? t("timer.unitMixed") : t("timer.unitMinutes")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onToggleSpeedUp}
          aria-pressed={speedUp}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-1 text-sm font-medium transition-colors",
            speedUp
              ? "border-warning-border bg-warning-surface text-warning-foreground"
              : "border-border/60 bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          <Zap className="size-3.5" />
          {speedUp ? t("timer.speedUpOn") : t("timer.speedUpOff")}
        </button>
        <button
          type="button"
          onClick={onToggleCompanion}
          aria-pressed={companionEnabled}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-1 text-sm font-medium transition-colors",
            companionEnabled
              ? "border-info-border bg-info-surface text-info-foreground"
              : "border-border/60 bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          {companionEnabled ? (
            <Egg className="size-3.5" />
          ) : (
            <EggOff className="size-3.5" />
          )}
          {companionEnabled
            ? t("timer.companionOn")
            : t("timer.companionOff")}
        </button>
      </div>
      {companionEnabled && childId && (
        <button
          type="button"
          onClick={onOpenCollection}
          className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PawPrint className="size-3.5" />
          {t("timer.collection.open")}
        </button>
      )}
      {speedUp && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {t("timer.speedUpHint")}
        </p>
      )}
    </div>
  );
}
