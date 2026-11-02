import { useState, useCallback, useRef } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
  verticalListSortingStrategy,
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
      <PageHeader
        title={t("crisis.title")}
        description={
          activeChild?.name
            ? t("crisis.subtitleWithName", { name: activeChild.name })
            : t("crisis.subtitle")
        }
        actions={
          <>
            {items && items.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setCrisisMode(true)}
                className="border-info-border bg-info-surface text-info-foreground hover:bg-info-surface/70"
              >
                <HandHeart className="mr-2 size-4" />
                {t("crisis.crisisMode")}
              </Button>
            )}
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("crisis.addButton")}
            </Button>
          </>
        }
      />

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
        <EmptyState title={t("crisis.emptyTitle")} description={t("crisis.emptyBody")} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-3">
              {items.map((item) => (
                <SortableCrisisItemCard
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SupportResources ref={supportRef} />
    </div>
  );
}
