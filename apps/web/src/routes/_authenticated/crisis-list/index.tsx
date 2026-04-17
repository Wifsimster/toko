import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Plus,
  HandHeart,
  Trash2,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shuffle,
  ChevronDown,
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PageLoader } from "@/components/ui/page-loader";
import { EmojiPicker, CRISIS_EMOJIS } from "@/components/emoji-picker";
import {
  useCrisisItems,
  useCreateCrisisItem,
  useUpdateCrisisItem,
  useDeleteCrisisItem,
  useReorderCrisisItems,
} from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/crisis-list/")({
  component: CrisisListPage,
});

function CrisisListPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrisisItem | null>(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: items, isLoading } = useCrisisItems(activeChildId ?? "");
  const reorder = useReorderCrisisItems();

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

  if (crisisMode && items?.length) {
    return (
      <CrisisView items={items} onClose={() => setCrisisMode(false)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("crisis.title")}
          </h1>
          <p className="text-muted-foreground">{t("crisis.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {items && items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setCrisisMode(true)}
              className="border-info-border bg-info-surface text-info-foreground hover:bg-info-surface/70"
            >
              <HandHeart className="mr-2 h-4 w-4" />
              {t("crisis.crisisMode")}
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("crisis.addButton")}
          </Button>
        </div>
      </div>

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

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("crisis.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <HandHeart className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              {t("crisis.emptyTitle")}
            </p>
            <p className="text-sm text-muted-foreground">{t("crisis.emptyBody")}</p>
          </CardContent>
        </Card>
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
    </div>
  );
}

function SortableCrisisItemCard({
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
          className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label={t("crisis.reorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div
          className="flex flex-1 cursor-pointer items-center gap-3 py-1"
          onClick={() => onEdit(item)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-xl">
            {item.emoji || "💙"}
          </span>
          <span className="flex-1 text-sm font-medium">{item.label}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                disabled={deleteItem.isPending}
                aria-label={t("crisis.delete")}
                className="flex h-10 w-10 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
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

function CrisisItemForm({
  initialData,
  onSuccess,
}: {
  initialData: CrisisItem | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const SUGGESTIONS = t("crisisSuggestions", { returnObjects: true }) as {
    emoji: string;
    label: string;
  }[];
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createItem = useCreateCrisisItem();
  const updateItem = useUpdateCrisisItem();
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");

  const isEdit = !!initialData;
  const isPending = createItem.isPending || updateItem.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    if (isEdit) {
      updateItem.mutate(
        {
          id: initialData.id,
          childId: activeChildId,
          label,
          emoji: emoji || undefined,
        },
        { onSuccess }
      );
    } else {
      createItem.mutate(
        {
          childId: activeChildId,
          label,
          emoji: emoji || undefined,
        },
        { onSuccess }
      );
    }
  };

  const handlePickSuggestion = (suggestion: { emoji: string; label: string }) => {
    setEmoji(suggestion.emoji);
    setLabel(suggestion.label);
  };

  const pickRandom = () => {
    const s = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]!;
    setEmoji(s.emoji);
    setLabel(s.label);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crisis-label">
          {isEdit ? t("crisis.editActivity") : t("crisis.labelPrompt")}
        </Label>
        <div className="flex gap-2">
          <EmojiPicker
            value={emoji}
            onSelect={setEmoji}
            emojis={CRISIS_EMOJIS}
            columns={5}
            placeholder="😊"
          >
            <button
              type="button"
              aria-label={t("crisis.chooseEmoji")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{emoji || <span className="opacity-50">😊</span>}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </EmojiPicker>
          <div className="flex flex-1 gap-1">
            <Input
              id="crisis-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("crisis.labelPlaceholder")}
              required
            />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={pickRandom}
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <TooltipContent>{t("crisis.randomSuggestion")}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("crisis.popularIdeas")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              <span className="text-sm">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || !label || isPending}
      >
        {isPending
          ? t("crisis.saving")
          : isEdit
            ? t("crisis.save")
            : t("crisis.addToList")}
      </Button>
    </form>
  );
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
    touchStartY.current = e.touches[0]!.clientY;
    swiping.current = true;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping.current) return;
      swiping.current = false;

      const deltaX = e.changedTouches[0]!.clientX - touchStartX.current;
      const deltaY = e.changedTouches[0]!.clientY - touchStartY.current;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}

function CrisisView({
  items,
  onClose,
}: {
  items: CrisisItem[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const item = items[currentIndex]!;

  const goNext = useCallback(() => {
    if (currentIndex >= items.length - 1) return;
    setDirection("left");
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setDirection("right");
    setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  useEffect(() => {
    if (direction) {
      const timeout = setTimeout(() => setDirection(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [direction, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const swipe = useSwipe(goNext, goPrev);

  return (
    <div
      className="fixed inset-0 z-50 flex touch-pan-y select-none flex-col items-center justify-center bg-gradient-to-b from-accent-50 via-background to-sage-50 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] dark:from-accent-900/30 dark:via-background dark:to-sage-900/30"
      {...swipe}
    >
      <button
        onClick={onClose}
        aria-label={t("crisis.closeCrisisMode")}
        className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
      >
        <X className="h-6 w-6" />
      </button>

      <nav
        aria-label={t("crisis.activitiesNav")}
        className="absolute top-[max(1.5rem,calc(env(safe-area-inset-top)+0.5rem))] left-1/2 flex -translate-x-1/2 gap-2"
      >
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? "left" : "right");
              setCurrentIndex(i);
            }}
            aria-label={t("crisis.activityLabel", {
              index: i + 1,
              label: items[i]!.label,
            })}
            aria-current={i === currentIndex ? "step" : undefined}
            className="flex h-8 w-8 items-center justify-center rounded-full"
          >
            <span
              className={`block h-2.5 w-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? "scale-125 bg-primary"
                  : "bg-primary/30"
              }`}
            />
          </button>
        ))}
      </nav>

      <div
        key={currentIndex}
        className={`flex flex-col items-center gap-6 px-8 text-center ${
          direction === "left"
            ? "animate-slide-in-right"
            : direction === "right"
              ? "animate-slide-in-left"
              : ""
        }`}
      >
        <span className="text-6xl sm:text-7xl animate-bounce-slow">
          {item.emoji || "💙"}
        </span>
        <p className="max-w-md text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl">
          {item.label}
        </p>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </p>
      </div>

      <p className="absolute bottom-20 text-xs text-muted-foreground/50 sm:hidden">
        {t("crisis.swipeHint")}
      </p>

      <div
        className="absolute bottom-8 hidden gap-4 sm:flex"
        role="navigation"
        aria-label={t("crisis.prevNextNav")}
      >
        <Button
          variant="ghost"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label={t("crisis.prevActivity")}
          className="h-14 w-14 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
          aria-label={t("crisis.nextActivity")}
          className="h-14 w-14 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
