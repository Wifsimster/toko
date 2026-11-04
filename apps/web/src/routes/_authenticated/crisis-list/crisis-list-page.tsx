import { useState, useCallback, useRef } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Mo } from "@/components/mo/mo";
import { useTranslation } from "react-i18next";

import {
  Plus,
  HandHeart,
  LifeBuoy,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  useCrisisItems,
  useReorderCrisisItems,
} from "@/hooks/use-crisis-list";
import { useChildren } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";
import { trackEvent } from "@/lib/analytics";
import { SupportResources } from "./support-resources";
import { SortableCrisisItemCard } from "./crisis-item-card";
import { CrisisItemForm } from "./crisis-item-form";
import { CrisisView } from "./crisis-view";

export default function CrisisListPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrisisItem | null>(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: items, isLoading } = useCrisisItems(activeChildId ?? "");
  const { data: children } = useChildren();
  const activeChild = children?.find((c) => c.id === activeChildId);
  const reorder = useReorderCrisisItems();
  const supportRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !activeChildId || !items) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);
      reorder.mutate({
        childId: activeChildId,
        orderedIds: reordered.map((i) => i.id),
      });
    },
    [items, activeChildId, reorder]
  );

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: CrisisItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const scrollToSupport = () => {
    const el = supportRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  };

  if (crisisMode && items?.length) {
    const handleCrisisClose = () => {
      trackEvent("sos_completed", { itemCount: items.length });
      setCrisisMode(false);
      setRatingOpen(true);
    };
    return <CrisisView items={items} onClose={handleCrisisClose} />;
  }

  const submitRating = (helpful: boolean) => {
    trackEvent("sos_helpful_rating", { helpful });
    setRatingOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={
            activeChild?.name
              ? t("crisis.helpsTitleWithName", { name: activeChild.name })
              : t("crisis.helpsTitle")
          }
          description={t("crisis.helpsSubtitle")}
        />
        <Mo state="accompagne" size={88} className="shrink-0" />
      </div>

      {items && items.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setCrisisMode(true)}
          className="min-h-14 w-full rounded-full border-[1.5px] border-foreground bg-surface-peach text-base font-extrabold text-foreground hover:bg-surface-peach/80 md:h-14"
        >
          <HandHeart className="mr-2 size-5" aria-hidden="true" />
          {t("crisis.openCrisisMode")}
        </Button>
      )}

      <button
        type="button"
        onClick={scrollToSupport}
        className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <LifeBuoy className="size-4 shrink-0" aria-hidden="true" />
        {t("crisis.supportJump")}
      </button>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("crisis.editTitle") : t("crisis.newTitle")}
            </DialogTitle>
          </DialogHeader>
          <CrisisItemForm
            key={editingItem?.id ?? "create"}
            initialData={editingItem}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("crisis.ratingTitle")}</DialogTitle>
            <DialogDescription>{t("crisis.ratingBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => submitRating(false)}>
              {t("crisis.ratingNo")}
            </Button>
            <Button onClick={() => submitRating(true)}>
              {t("crisis.ratingYes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!activeChildId ? (
        <EmptyState title={t("crisis.selectChild")} />
      ) : isLoading ? (
        <PageLoader />
      ) : !items?.length ? (
        <EmptyState
          title={t("crisis.emptyTitle")}
          description={t("crisis.emptyBody")}
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("crisis.addButton")}
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item, index) => (
                <SortableCrisisItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={openEdit}
                />
              ))}
              <button
                type="button"
                onClick={openCreate}
                className="flex min-h-32 flex-col items-center justify-center gap-1 rounded-[20px] border-[1.5px] border-dashed border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-6" aria-hidden="true" />
                <span className="text-[0.9375rem] font-bold">{t("crisis.addButton")}</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SupportResources ref={supportRef} />
    </div>
  );
}
