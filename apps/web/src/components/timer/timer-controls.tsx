import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SequenceTemplate } from "./sequences";

export function TimerControls({
  running,
  idle,
  finished,
  durationSec,
  fullscreen,
  activeSequence,
  onPlayPause,
  onReset,
  onCancelSequence,
  onExitFullscreen,
}: {
  running: boolean;
  idle: boolean;
  finished: boolean;
  durationSec: number;
  fullscreen: boolean;
  activeSequence: SequenceTemplate | null;
  onPlayPause: () => void;
  onReset: () => void;
  onCancelSequence: () => void;
  onExitFullscreen: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        size="lg"
        onClick={onPlayPause}
        className="gap-2 px-6"
        disabled={durationSec === 0}
      >
        {running ? (
          <>
            <Pause className="size-4" /> {t("timer.pause")}
          </>
        ) : (
          <>
            <Play className="size-4" /> {t("timer.start")}
          </>
        )}
      </Button>
      {!idle && (
        <Button
          size="lg"
          variant="outline"
          onClick={onReset}
          aria-label={t("timer.reset")}
        >
          <RotateCcw className="size-4" />
        </Button>
      )}
      {activeSequence && (
        <Button
          size="lg"
          variant="ghost"
          onClick={onCancelSequence}
          aria-label={t("timer.cancelSequence")}
        >
          <X className="size-4" />
        </Button>
      )}
      {fullscreen && (
        <Button
          size="lg"
          variant="ghost"
          onClick={onExitFullscreen}
          aria-label={t("timer.exitFullscreen")}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
