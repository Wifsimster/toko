import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BehaviorWeekHeaderProps {
  weekLabel: string;
  isCurrentWeek: boolean;
  thisWeekLabel: string;
  prevLabel: string;
  nextLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToThisWeek: () => void;
}

export function BehaviorWeekHeader({
  weekLabel,
  isCurrentWeek,
  thisWeekLabel,
  prevLabel,
  nextLabel,
  onPrevWeek,
  onNextWeek,
  onGoToThisWeek,
}: BehaviorWeekHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onPrevWeek} aria-label={prevLabel}>
        <ChevronLeft className="size-4" />
      </Button>
      <p className="min-w-0 px-1 text-sm font-semibold" aria-live="polite">
        {weekLabel}
      </p>
      <Button variant="ghost" size="icon" onClick={onNextWeek} aria-label={nextLabel}>
        <ChevronRight className="size-4" />
      </Button>
      {!isCurrentWeek && (
        <Button variant="link" size="sm" onClick={onGoToThisWeek}>
          {thisWeekLabel}
        </Button>
      )}
    </div>
  );
}
