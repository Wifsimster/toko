
import { useTranslation } from "react-i18next";

import {
  Trash2,
  GripVertical,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
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

/** One strategy in the editable list, draggable into a new position. */

export function SortableCrisisItemCard({
  item,
  onEdit,
}: {
  item: CrisisItem;
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
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all hover:shadow-sm ${
        isDragging ? "opacity-50 shadow-lg z-10" : ""
      }`}
    >
      <CardContent className="flex items-center gap-2 py-2 pl-2 pr-3 sm:gap-3 sm:pl-3 sm:pr-4">
        <button
          type="button"
          className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label={t("crisis.reorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center gap-3 py-1 text-left"
          onClick={() => onEdit(item)}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-xl">
            {item.emoji || "💙"}
          </span>
          <span className="flex-1 text-sm font-medium">{item.label}</span>
        </button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                disabled={deleteItem.isPending}
                aria-label={t("crisis.delete")}
                className="flex size-11 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
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
      </CardContent>
    </Card>
  );
}
