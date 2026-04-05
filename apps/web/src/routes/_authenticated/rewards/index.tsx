import { useState, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Gift,
  Lock,
  Plus,
  Star,
  Trash2,
  PartyPopper,
  GripVertical,
  Pencil,
  Check,
  X,
  Sparkles,
  Shuffle,
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
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressValue } from "@/components/ui/progress";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EmojiPicker } from "@/components/emoji-picker";
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
import {
  useBarkleyRewards,
  useCreateBarkleyReward,
  useUpdateBarkleyReward,
  useDeleteBarkleyReward,
  useReorderBarkleyRewards,
  useBarkleyStarCount,
  useClaimBarkleyReward,
} from "@/hooks/use-barkley";
import { useChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import { BehaviorTracking } from "@/components/barkley/behavior-tracking";
import type { BarkleyReward } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/rewards/")({
  component: RewardsPage,
});

// ─── Predefined Suggestions ─────────────────────────────

const REWARD_SUGGESTIONS = [
  { icon: "🎨", name: "Un temps de dessin avec maman/papa" },
  { icon: "🎮", name: "30 min de jeux vidéo" },
  { icon: "🍦", name: "Un cornet de glace" },
  { icon: "🍕", name: "Choisir le repas du soir" },
  { icon: "🎬", name: "Soirée film en famille" },
  { icon: "🛝", name: "Sortie au parc" },
  { icon: "🧩", name: "Un nouveau puzzle ou jeu" },
  { icon: "📖", name: "Choisir l'histoire du soir" },
  { icon: "🍿", name: "Soirée popcorn" },
  { icon: "🎪", name: "Sortie spéciale (zoo, cirque...)" },
  { icon: "🛍️", name: "Un petit cadeau surprise" },
  { icon: "👑", name: "Roi/Reine de la journée" },
  { icon: "🍫", name: "Un bonbon ou chocolat" },
  { icon: "📺", name: "Un épisode en plus" },
  { icon: "🎈", name: "Inviter un ami à la maison" },
  { icon: "🏊", name: "Sortie piscine" },
  { icon: "🎤", name: "Soirée karaoké" },
  { icon: "🍰", name: "Faire un gâteau ensemble" },
  { icon: "💤", name: "Se coucher 30 min plus tard" },
  { icon: "🚴", name: "Balade à vélo" },
];

// ─── Page ────────────────────────────────────────────────

function RewardsPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Récompenses</h1>
          <p className="text-muted-foreground">
            Tableau de récompenses à débloquer avec des étoiles
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour accéder aux récompenses.
          </CardContent>
        </Card>
      </div>
    );
  }

  return <RewardBoard childId={activeChildId} />;
}

// ─── Board ───────────────────────────────────────────────

function RewardBoard({ childId }: { childId: string }) {
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [celebratedReward, setCelebratedReward] = useState<BarkleyReward | null>(null);
  const { data: child } = useChild(childId);
  const { data: rewards = [], isLoading: rewardsLoading } =
    useBarkleyRewards(childId);
  const { data: starData, isLoading: starsLoading } =
    useBarkleyStarCount(childId);
  const claimReward = useClaimBarkleyReward();
  const deleteReward = useDeleteBarkleyReward();
  const reorder = useReorderBarkleyRewards();

  const totalStars = starData?.totalStars ?? 0;
  const availableStars = starData?.availableStars ?? totalStars;
  const spentStars = starData?.spentStars ?? 0;

  // Sort by sortOrder — rewards are always active (re-claimable)
  const sortedRewards = [...rewards].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const reachableCount = sortedRewards.filter(
    (r) => availableStars >= (r.starsRequired ?? 0)
  ).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedRewards.findIndex((r) => r.id === active.id);
      const newIndex = sortedRewards.findIndex((r) => r.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sortedRewards, oldIndex, newIndex);
      reorder.mutate({ childId, orderedIds: reordered.map((r) => r.id) });
    },
    [sortedRewards, childId, reorder]
  );

  const handleClaim = (reward: BarkleyReward) => {
    claimReward.mutate(
      { id: reward.id, childId },
      {
        onSuccess: () => setCelebratedReward(reward),
      }
    );
  };

  if (rewardsLoading || starsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Weekly behavior tracking grid */}
      <BehaviorTracking childId={childId} />

      {/* Visual connector: available stars balance */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700" />
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-amber-50 dark:bg-amber-950/30 px-3 sm:px-4 py-2 border border-amber-200/60 dark:border-amber-800/40 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold text-amber-700 dark:text-amber-300 tabular-nums">
              {availableStars}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
              étoile{availableStars !== 1 ? "s" : ""} disponible{availableStars !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-amber-600/70 dark:text-amber-400/70 tabular-nums">
            <span>Gagnées : {totalStars}</span>
            <span aria-hidden="true">·</span>
            <span>Dépensées : {spentStars}</span>
            {reachableCount > 0 && sortedRewards.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium">
                  {reachableCount} à débloquer
                </span>
              </>
            )}
          </div>
        </div>
        <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700" />
      </div>

      {/* Reward section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          Récompenses à débloquer
        </h2>
        <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Ajouter
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle récompense</DialogTitle>
            </DialogHeader>
            <RewardForm
              childId={childId}
              availableStars={availableStars}
              weeklyRate={starData?.weeklyStars ?? 0}
              onSuccess={() => setRewardDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Reward cards */}
      {sortedRewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium">Aucune récompense</p>
            <p className="text-sm mt-1">
              Ajoutez des récompenses motivantes que votre enfant pourra
              débloquer en gagnant des étoiles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedRewards.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedRewards.map((reward) => (
                <SortableRewardCard
                  key={reward.id}
                  reward={reward}
                  childId={childId}
                  availableStars={availableStars}
                  isEditing={editingId === reward.id}
                  onStartEdit={() => setEditingId(reward.id)}
                  onStopEdit={() => setEditingId(null)}
                  onClaim={() => handleClaim(reward)}
                  onDelete={() =>
                    deleteReward.mutate({ id: reward.id, childId })
                  }
                  claimPending={claimReward.isPending}
                  deletePending={deleteReward.isPending}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {celebratedReward && (
        <CelebrationOverlay
          reward={celebratedReward}
          childName={child?.name}
          onClose={() => setCelebratedReward(null)}
        />
      )}
    </div>
  );
}

// ─── Celebration Overlay (shown on claim) ──────────────

function CelebrationOverlay({
  reward,
  childName,
  onClose,
}: {
  reward: BarkleyReward;
  childName?: string | null;
  onClose: () => void;
}) {
  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/60 dark:via-orange-950/60 dark:to-rose-950/60 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex gap-3 text-3xl animate-bounce-slow" aria-hidden="true">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
        </div>
        <div
          className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/70 dark:bg-white/10 text-6xl shadow-lg ring-4 ring-amber-300/50"
          aria-hidden="true"
        >
          {reward.icon || "🎁"}
        </div>
        <div>
          <h2
            id="celebration-title"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            {childName ? `Bravo ${childName} !` : "Bravo !"}
          </h2>
          <p className="mt-2 max-w-sm text-base text-foreground/80">
            Tu as débloqué{" "}
            <strong className="text-foreground">{reward.name}</strong>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-amber-700 dark:text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>
              {reward.starsRequired} étoile
              {reward.starsRequired !== 1 ? "s" : ""} dépensée
              {reward.starsRequired !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Button
          onClick={onClose}
          size="lg"
          className="min-w-40 bg-amber-500 hover:bg-amber-600 text-white shadow-md"
        >
          Super ! 🎈
        </Button>
      </div>
    </div>
  );
}

// ─── Sortable Reward Card ────────────────────────────────

function SortableRewardCard({
  reward,
  childId,
  availableStars,
  isEditing,
  onStartEdit,
  onStopEdit,
  onClaim,
  onDelete,
  claimPending,
  deletePending,
}: {
  reward: BarkleyReward;
  childId: string;
  availableStars: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onClaim: () => void;
  onDelete: () => void;
  claimPending: boolean;
  deletePending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reward.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <RewardCardEdit
        reward={reward}
        childId={childId}
        onDone={onStopEdit}
      />
    );
  }

  const starsNeeded = reward.starsRequired ?? 0;
  const isUnlockable = availableStars >= starsNeeded;
  const progress =
    starsNeeded > 0 ? Math.min((availableStars / starsNeeded) * 100, 100) : 100;
  const remaining = Math.max(starsNeeded - availableStars, 0);
  const timesClaimed = reward.timesClaimed ?? 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isDragging ? "opacity-50 shadow-lg" : ""
        } ${
          isUnlockable
            ? "border-amber-300 bg-gradient-to-b from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 dark:border-amber-800/30 ring-2 ring-amber-400/50"
            : "opacity-75"
        }`}
      >
        <CardContent className="py-3 px-3 sm:py-4 sm:px-4">
          <div className="flex items-start gap-2 sm:gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              aria-label="Déplacer"
              className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div
              className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-xl sm:text-2xl ${
                isUnlockable
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-muted grayscale"
              }`}
            >
              {reward.icon || "🎁"}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold break-words">
                      {reward.name}
                    </h3>
                    {!isUnlockable && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    )}
                    {timesClaimed > 0 && (
                      <span
                        className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300"
                        aria-label={`Débloquée ${timesClaimed} fois`}
                      >
                        <PartyPopper className="h-2.5 w-2.5" />×{timesClaimed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1">
                  <button
                    onClick={onStartEdit}
                    aria-label="Modifier"
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors rounded hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={onDelete}
                    aria-label="Supprimer"
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground/60 hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                    disabled={deletePending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Star requirement */}
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  {starsNeeded === 0
                    ? "Gratuite"
                    : isUnlockable
                      ? `Coûte ${starsNeeded} étoile${starsNeeded > 1 ? "s" : ""}`
                      : `${remaining} étoile${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Progress bar */}
              {starsNeeded > 0 && (
                <div className="mt-2">
                  <Progress value={progress}>
                    <ProgressValue>
                      {() =>
                        `${Math.min(availableStars, starsNeeded)} / ${starsNeeded}`
                      }
                    </ProgressValue>
                  </Progress>
                </div>
              )}

              {/* Claim button */}
              {isUnlockable && (
                <Button
                  size="sm"
                  className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={onClaim}
                  disabled={claimPending}
                >
                  <PartyPopper className="mr-1.5 h-3.5 w-3.5" />
                  {claimPending
                    ? "Déblocage..."
                    : timesClaimed > 0
                      ? "Débloquer à nouveau"
                      : "Débloquer !"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reward Card Edit Mode ───────────────────────────────

function RewardCardEdit({
  reward,
  childId,
  onDone,
}: {
  reward: BarkleyReward;
  childId: string;
  onDone: () => void;
}) {
  const updateReward = useUpdateBarkleyReward();
  const [name, setName] = useState(reward.name);
  const [icon, setIcon] = useState(reward.icon || "");
  const [starsRequired, setStarsRequired] = useState(
    reward.starsRequired ?? 5
  );
  const handleSave = () => {
    if (!name.trim()) return;
    const safeStar = Number.isFinite(starsRequired) ? starsRequired : 0;
    updateReward.mutate(
      {
        id: reward.id,
        childId,
        name: name.trim(),
        icon: icon || undefined,
        starsRequired: safeStar,
      },
      {
        onSuccess: onDone,
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Erreur lors de la mise à jour"
          );
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") onDone();
  };

  return (
    <Card className="border-primary/50 ring-2 ring-primary/20">
      <CardContent className="py-4 px-3 sm:px-4 space-y-3">
        <div className="space-y-2">
          <InputGroup>
            <EmojiPicker value={icon} onSelect={setIcon} />
            <InputGroupInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </InputGroup>
          <div className="flex items-center gap-2">
            <Label htmlFor={`edit-stars-${reward.id}`} className="text-xs text-muted-foreground shrink-0">
              Étoiles
            </Label>
            <Input
              id={`edit-stars-${reward.id}`}
              type="number"
              min={0}
              value={starsRequired}
              onChange={(e) => setStarsRequired(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              className="w-24"
            />
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        {updateReward.isError && (
          <p className="text-xs text-destructive">
            {updateReward.error instanceof Error
              ? updateReward.error.message
              : "Erreur lors de la mise à jour"}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onDone}>
            <X className="mr-1 h-3.5 w-3.5" />
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim() || updateReward.isPending}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            {updateReward.isPending ? "..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Reward Form (create dialog) ────────────────────────

function RewardForm({
  childId,
  availableStars,
  weeklyRate,
  onSuccess,
}: {
  childId: string;
  availableStars: number;
  weeklyRate: number;
  onSuccess: () => void;
}) {
  const createReward = useCreateBarkleyReward();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [starsRequired, setStarsRequired] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reachability hint: how many days until the child can claim?
  const gap = Math.max(0, starsRequired - availableStars);
  const dailyRate = weeklyRate / 7;
  let reachability: string | null = null;
  if (starsRequired > 0) {
    if (availableStars >= starsRequired) {
      reachability = "Déjà atteignable avec le solde actuel.";
    } else if (dailyRate > 0) {
      const days = Math.ceil(gap / dailyRate);
      if (days <= 1) reachability = "Atteignable en environ 1 jour au rythme actuel.";
      else if (days <= 30)
        reachability = `Atteignable en environ ${days} jours au rythme actuel.`;
      else reachability = "Atteignable à long terme — envisagez plus petit.";
    } else {
      reachability = "Commencez à cocher des comportements pour estimer le délai.";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReward.mutate(
      {
        childId,
        name,
        starsRequired,
        icon: icon || undefined,
      },
      { onSuccess }
    );
  };

  const handlePickSuggestion = (suggestion: {
    icon: string;
    name: string;
  }) => {
    setIcon(suggestion.icon);
    setName(suggestion.name);
    setShowSuggestions(false);
  };

  const pickRandom = () => {
    const s =
      REWARD_SUGGESTIONS[
        Math.floor(Math.random() * REWARD_SUGGESTIONS.length)
      ]!;
    setIcon(s.icon);
    setName(s.name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reward-name">Nom de la récompense</Label>
        <InputGroup>
          <EmojiPicker value={icon} onSelect={setIcon} />
          <InputGroupInput
            id="reward-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Un temps de dessin avec maman"
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

      <div className="space-y-2">
        <Label htmlFor="reward-stars">Étoiles nécessaires</Label>
        <Input
          id="reward-stars"
          type="number"
          min={0}
          value={starsRequired}
          onChange={(e) => setStarsRequired(Number(e.target.value))}
          required
        />
        <p className="text-xs text-muted-foreground">
          Coût en étoiles pour débloquer cette récompense.
        </p>
        {reachability && (
          <p className="text-xs text-primary">💡 {reachability}</p>
        )}
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
          {REWARD_SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!name || createReward.isPending}
      >
        {createReward.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
