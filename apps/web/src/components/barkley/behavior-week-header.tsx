import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BehaviorWeekHeaderProps {
  childName: string;
  weekLabel: string;
  isCurrentWeek: boolean;
  weeklyStars: number;
  maxStars: number;
  thisWeekLabel: string;
  starsLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToThisWeek: () => void;
}

export function BehaviorWeekHeader({
  childName,
  weekLabel,
  isCurrentWeek,
  weeklyStars,
  maxStars,
  thisWeekLabel,
  starsLabel,
  onPrevWeek,
  onNextWeek,
  onGoToThisWeek,
}: BehaviorWeekHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl sm:text-2xl font-bold font-heading break-words">
        {childName}
      </h2>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevWeek}
          className="size-7"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <button
          type="button"
          onClick={onGoToThisWeek}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          title={thisWeekLabel}
        >
          {weekLabel}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          className="size-7"
        >
          <ChevronRight className="size-4" />
        </Button>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={onGoToThisWeek}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {thisWeekLabel}
          </button>
        )}
      </div>
      {maxStars > 0 && (
        <p className="text-sm text-muted-foreground">{starsLabel}</p>
      )}
    </div>
  );
}
