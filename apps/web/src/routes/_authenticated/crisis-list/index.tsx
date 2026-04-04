import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
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

// ─── Suggestions ────────────────────────────────────────

const SUGGESTIONS = [
  { emoji: "🧸", label: "Câliner mon doudou" },
  { emoji: "🎵", label: "Écouter de la musique douce" },
  { emoji: "📺", label: "Regarder mon dessin animé préféré" },
  { emoji: "🫧", label: "Faire des bulles de savon" },
  { emoji: "🖍️", label: "Dessiner ou colorier" },
  { emoji: "🤗", label: "Un gros câlin" },
  { emoji: "📖", label: "Lire une histoire" },
  { emoji: "🧘", label: "Respirer profondément" },
  { emoji: "🏃", label: "Courir ou sauter dehors" },
  { emoji: "🛁", label: "Prendre un bain chaud" },
  { emoji: "🎮", label: "Jouer à un jeu vidéo" },
  { emoji: "🐾", label: "Caresser un animal" },
  { emoji: "🧩", label: "Faire un puzzle" },
  { emoji: "🎨", label: "Faire de la peinture" },
  { emoji: "🌳", label: "Se promener dans la nature" },
  { emoji: "💤", label: "Se reposer au calme" },
  { emoji: "🎧", label: "Écouter un podcast ou une histoire audio" },
  { emoji: "🫂", label: "Parler à quelqu'un que j'aime" },
  { emoji: "⚽", label: "Jouer au ballon" },
  { emoji: "🍫", label: "Manger un petit goûter" },
];

// ─── Page ──────────────────────────────────────────────

function CrisisListPage() {
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
            Liste de la crise
          </h1>
          <p className="text-muted-foreground">
            Les choses qui me font du bien quand ça ne va pas
          </p>
        </div>
        <div className="flex gap-2">
          {items && items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setCrisisMode(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              <HandHeart className="mr-2 h-4 w-4" />
              Mode crise
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier" : "Qu'est-ce qui te fait du bien ?"}
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
            Sélectionnez un enfant pour voir sa liste de la crise.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <HandHeart className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              La liste est vide
            </p>
            <p className="text-sm text-muted-foreground">
              Construisez cette liste avec votre enfant : qu'est-ce qui lui fait
              du bien quand ça ne va pas ?
            </p>
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

// ─── Sortable Item Card ─────────────────────────────────

function SortableCrisisItemCard({
  item,
  onEdit,
}: {
  item: CrisisItem;
  onEdit: (item: CrisisItem) => void;
}) {
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
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <button
          className="shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Réordonner"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div
          className="flex flex-1 cursor-pointer items-center gap-3"
          onClick={() => onEdit(item)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950">
            {item.emoji || "💙"}
          </span>
          <span className="flex-1 text-sm font-medium">{item.label}</span>
        </div>
        <button
          onClick={() =>
            activeChildId &&
            deleteItem.mutate({ id: item.id, childId: activeChildId })
          }
          disabled={deleteItem.isPending}
          aria-label="Supprimer"
          className="rounded p-1.5 text-muted-foreground/30 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}

// ─── Form ──────────────────────────────────────────────

function CrisisItemForm({
  initialData,
  onSuccess,
}: {
  initialData: CrisisItem | null;
  onSuccess: () => void;
}) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createItem = useCreateCrisisItem();
  const updateItem = useUpdateCrisisItem();
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    setShowSuggestions(false);
  };

  const pickRandom = () => {
    const s =
      SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]!;
    setEmoji(s.emoji);
    setLabel(s.label);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crisis-label">
          {isEdit ? "Modifier l'activité" : "Qu'est-ce qui te fait du bien ?"}
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
              aria-label="Choisir un emoji"
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
              placeholder="Regarder mon dessin animé préféré"
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
              <TooltipContent>Suggestion au hasard</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {showSuggestions ? "Masquer les idées" : "Des idées ?"}
      </Button>

      {showSuggestions && (
        <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto rounded-lg border p-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
            >
              <span className="text-base">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || !label || isPending}
      >
        {isPending
          ? "Enregistrement..."
          : isEdit
            ? "Enregistrer"
            : "Ajouter à ma liste"}
      </Button>
    </form>
  );
}

// ─── Swipe hook ─────────────────────────────────────────

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

      // Only trigger if horizontal swipe is dominant and long enough
      if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}

// ─── Crisis View (full-screen reading mode) ──────────────

function CrisisView({
  items,
  onClose,
}: {
  items: CrisisItem[];
  onClose: () => void;
}) {
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

  // Reset animation direction after transition
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 touch-pan-y select-none"
      {...swipe}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Fermer le mode crise"
        className="absolute right-4 top-4 z-10 rounded-full p-3 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Progress dots */}
      <nav aria-label="Navigation des activités" className="absolute top-6 left-1/2 flex -translate-x-1/2 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? "left" : "right");
              setCurrentIndex(i);
            }}
            aria-label={`Activité ${i + 1}: ${items[i]!.label}`}
            aria-current={i === currentIndex ? "step" : undefined}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-blue-500 scale-125"
                : "bg-blue-300/40 dark:bg-blue-600/40"
            }`}
          />
        ))}
      </nav>

      {/* Main content with slide animation */}
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

      {/* Swipe hint on mobile */}
      <p className="absolute bottom-20 text-xs text-muted-foreground/50 sm:hidden">
        Glissez pour naviguer
      </p>

      {/* Navigation buttons (desktop) */}
      <div className="absolute bottom-8 hidden gap-4 sm:flex" role="navigation" aria-label="Précédent / Suivant">
        <Button
          variant="ghost"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Activité précédente"
          className="h-14 w-14 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
          aria-label="Activité suivante"
          className="h-14 w-14 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
