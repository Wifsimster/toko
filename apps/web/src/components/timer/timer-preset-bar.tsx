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
      <div className="flex flex-wrap items-center justify-center gap-2">
        {speedUp
          ? presetSpeedupSeconds.map((s) => {
              const active = durationSec === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetSeconds(s)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-background hover:bg-accent"
                  )}
                >
                  {s < 60
                    ? t("timer.seconds", { count: s })
                    : t("timer.minutes", { count: s / 60 })}
                </button>
              );
            })
          : presetMinutes.map((m) => {
              const active = durationSec === m * 60;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSetMinutes(m)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-background hover:bg-accent"
                  )}
                >
                  {t("timer.minutes", { count: m })}
                </button>
              );
            })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onToggleSpeedUp}
          aria-pressed={speedUp}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
