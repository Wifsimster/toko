import { useTranslation } from "react-i18next";
import {
  GripVertical,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BarkleyBehavior } from "@focusflow/validators";
import { DeleteBehaviorButton } from "./delete-behavior-button";

/** One behaviour as a desktop grid row: seven day cells, reorderable. */

export function SortableBehaviorRow({
  behavior,
  isLast,
  weekDates,
  isChecked,
  onToggle,
  onDelete,
  togglePending,
  deletePending,
}: {
  behavior: BarkleyBehavior;
  isLast: boolean;
  weekDates: string[];
  isChecked: (behaviorId: string, date: string) => boolean;
  onToggle: (behaviorId: string, date: string) => void;
  onDelete: () => void;
  togglePending: boolean;
  deletePending: boolean;
}) {
  const { t } = useTranslation();
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
    <div
      ref={setNodeRef}
      style={style}
      className={`grid min-w-[640px] grid-cols-[28px_1fr_repeat(7,_minmax(36px,_1fr))_40px] items-center px-3 py-2.5 ${
        !isLast ? "border-b" : ""
      } hover:bg-muted/30 transition-colors ${isDragging ? "opacity-50 bg-muted/50 z-10" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">
          {behavior.icon || "✅"}
        </span>
        <span className="text-sm font-medium truncate">
          {behavior.name}
        </span>
      </div>

      {weekDates.map((date) => {
        const checked = isChecked(behavior.id, date);
        return (
          <div key={date} className="flex justify-center">
            <button
              type="button"
              onClick={() => onToggle(behavior.id, date)}
              className={`flex size-8 items-center justify-center rounded-full transition-all ${
                checked
                  ? "scale-110"
                  : "hover:bg-muted/50 hover:scale-105 active:bg-muted/50 active:scale-105"
              }`}
              disabled={togglePending}
              title={checked ? t("behaviorTracking.removeStar") : t("behaviorTracking.addStar")}
            >
              {checked ? (
                <span className="text-xl leading-none">⭐</span>
              ) : (
                <span className="text-muted-foreground/30 text-lg leading-none">
                  ☆
                </span>
              )}
            </button>
          </div>
        );
      })}

      <div className="flex justify-center">
        <DeleteBehaviorButton
          name={behavior.name}
          onDelete={onDelete}
          pending={deletePending}
          className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded"
        />
      </div>
    </div>
  );
}
