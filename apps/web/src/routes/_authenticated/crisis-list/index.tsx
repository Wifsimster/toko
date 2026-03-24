import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  HandHeart,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import {
  useCrisisItems,
  useCreateCrisisItem,
  useDeleteCrisisItem,
  useReorderCrisisItems,
} from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/crisis-list/")({
  component: CrisisListPage,
});

function CrisisListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: items, isLoading } = useCrisisItems(activeChildId ?? "");

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Qu'est-ce qui te fait du bien ?
                </DialogTitle>
              </DialogHeader>
              <CrisisItemForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
        <div className="grid gap-3">
          {items.map((item, index) => (
            <CrisisItemCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              allItems={items}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Item Card ──────────────────────────────────────────

function CrisisItemCard({
  item,
  index,
  total,
  allItems,
}: {
  item: CrisisItem;
  index: number;
  total: number;
  allItems: CrisisItem[];
}) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const deleteItem = useDeleteCrisisItem();
  const reorder = useReorderCrisisItems();

  const move = (direction: "up" | "down") => {
    if (!activeChildId) return;
    const ids = allItems.map((i) => i.id);
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [ids[index], ids[swapIdx]] = [ids[swapIdx]!, ids[index]!];
    reorder.mutate({ childId: activeChildId, orderedIds: ids });
  };

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950">
          {item.emoji || "💙"}
        </span>
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => move("up")}
            disabled={index === 0 || reorder.isPending}
            className="rounded p-1.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move("down")}
            disabled={index === total - 1 || reorder.isPending}
            className="rounded p-1.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() =>
              activeChildId &&
              deleteItem.mutate({ id: item.id, childId: activeChildId })
            }
            disabled={deleteItem.isPending}
            className="rounded p-1.5 text-muted-foreground/30 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

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

// ─── Form ──────────────────────────────────────────────

function CrisisItemForm({ onSuccess }: { onSuccess: () => void }) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createItem = useCreateCrisisItem();
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    createItem.mutate(
      {
        childId: activeChildId,
        label,
        emoji: emoji || undefined,
      },
      { onSuccess }
    );
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
          Qu'est-ce qui te fait du bien ?
        </Label>
        <InputGroup>
          <InputGroupInput
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🧸"
            maxLength={10}
            className="w-14 flex-none text-center text-lg"
          />
          <InputGroupInput
            id="crisis-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Regarder mon dessin animé préféré"
            required
          />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton onClick={pickRandom}>
                    <Shuffle className="h-3.5 w-3.5" />
                  </InputGroupButton>
                }
              />
              <TooltipContent>Suggestion au hasard</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
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
        disabled={!activeChildId || !label || createItem.isPending}
      >
        {createItem.isPending ? "Enregistrement..." : "Ajouter à ma liste"}
      </Button>
    </form>
  );
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
  const item = items[currentIndex]!;

  const goNext = () =>
    setCurrentIndex((i) => Math.min(i + 1, items.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-3 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 flex -translate-x-1/2 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-blue-500 scale-125"
                : "bg-blue-300/40 dark:bg-blue-600/40"
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 px-8 text-center">
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

      {/* Navigation */}
      <div className="absolute bottom-8 flex gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="h-14 w-14 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
          className="h-14 w-14 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
