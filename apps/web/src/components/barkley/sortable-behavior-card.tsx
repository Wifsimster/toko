import {
  GripVertical,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import type { BarkleyBehavior } from "@focusflow/validators";
import { DeleteBehaviorButton } from "./delete-behavior-button";

/** The same behaviour as a phone card — the grid does not fit at 400px. */

export function SortableBehaviorCard({
  behavior,
  weekDates,
  dayLabels,
  isChecked,
  onToggle,
  onDelete,
  togglePending,
  deletePending,
}: {
  behavior: BarkleyBehavior;
  weekDates: string[];
  dayLabels: string[];
  isChecked: (behaviorId: string, date: string) => boolean;
  onToggle: (behaviorId: string, date: string) => void;
  onDelete: () => void;
  togglePending: boolean;
  deletePending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: behavior.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`overflow-hidden ${isDragging ? "opacity-50 shadow-lg" : ""}`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="flex size-11 -my-2 -ml-2 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing shrink-0"
              >
                <GripVertical className="size-4" />
              </button>
              <span className="text-lg shrink-0">
                {behavior.icon || "✅"}
              </span>
              <span className="text-sm font-semibold truncate">
                {behavior.name}
              </span>
            </div>
            <DeleteBehaviorButton
              name={behavior.name}
              onDelete={onDelete}
              pending={deletePending}
              className="flex size-11 -my-2 -mr-2 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
            />
          </div>
          <div className="flex justify-between gap-1">
            {weekDates.map((date, i) => {
              const checked = isChecked(behavior.id, date);
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onToggle(behavior.id, date)}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-1.5 transition-all ${
                    checked
                      ? "bg-warning-surface"
                      : "hover:bg-muted/50 active:bg-muted/50"
                  }`}
                  disabled={togglePending}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {dayLabels[i]}
                  </span>
                  {checked ? (
                    <span className="text-lg leading-none">⭐</span>
                  ) : (
                    <span className="text-muted-foreground/30 text-lg leading-none">
                      ☆
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
