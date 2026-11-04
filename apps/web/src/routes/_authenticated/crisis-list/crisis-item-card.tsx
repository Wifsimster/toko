
import { CrisisIcon } from "@/components/shared/crisis-icon";
import { useTranslation } from "react-i18next";

import {
  Trash2,
  GripVertical,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteCrisisItem,
} from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";

const TILE_SURFACES = [
  "bg-surface-peach",
  "bg-surface-lavender",
  "bg-surface-mint",
  "bg-surface-sky",
  "bg-surface-honey",
] as const;

export function SortableCrisisItemCard({
  item,
  index,
  onEdit,
}: {
  item: CrisisItem;
  index: number;
  onEdit: (item: CrisisItem) => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const deleteItem = useDeleteCrisisItem();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex min-h-32 flex-col rounded-[20px] p-2 transition-shadow ${
        TILE_SURFACES[index % TILE_SURFACES.length]
      } ${isDragging ? "z-10 opacity-60 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between">
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-2xl bg-card/70">
          <CrisisIcon emoji={item.emoji} name={item.label} size={32} className="size-6" />
        </span>
        <div className="flex">
        <button
          type="button"
          className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded text-foreground/40 hover:text-foreground active:cursor-grabbing"
          aria-label={t("crisis.reorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                disabled={deleteItem.isPending}
                aria-label={t("crisis.delete")}
                className="flex size-11 items-center justify-center rounded text-foreground/40 transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("crisis.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("crisis.deleteBody", { label: item.label })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("crisis.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  activeChildId &&
                  deleteItem.mutate({ id: item.id, childId: activeChildId })
                }
              >
                {t("crisis.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
      <button
        type="button"
        className="mt-1 flex flex-1 cursor-pointer items-end px-2 pb-1.5 text-left text-[0.9375rem] leading-snug font-bold [overflow-wrap:anywhere]"
        onClick={() => onEdit(item)}
      >
        {item.label}
      </button>
    </div>
  );
}
