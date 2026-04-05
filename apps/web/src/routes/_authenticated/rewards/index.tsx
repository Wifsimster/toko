import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Gift,
  Lock,
  Plus,
  Star,
  Trash2,
  PartyPopper,
  Pencil,
  Sparkles,
  Shuffle,
} from "lucide-react";
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
  const [editingReward, setEditingReward] = useState<BarkleyReward | null>(null);
  const { data: child } = useChild(childId);
  const { data: rewards = [], isLoading: rewardsLoading } =
    useBarkleyRewards(childId);
  const { data: starData, isLoading: starsLoading } =
    useBarkleyStarCount(childId);
  const claimReward = useClaimBarkleyReward();
  const deleteReward = useDeleteBarkleyReward();

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

  // Nearest locked reward — the dopamine goalpost for the child
  const nextLockedReward = sortedRewards
    .filter((r) => availableStars < (r.starsRequired ?? 0))
    .sort(
      (a, b) => (a.starsRequired ?? 0) - (b.starsRequired ?? 0)
    )[0];
  const starsUntilNext = nextLockedReward
    ? (nextLockedReward.starsRequired ?? 0) - availableStars
    : 0;

  const handleClaim = (reward: BarkleyReward) => {
    claimReward.mutate(
      { id: reward.id, childId },
      {
        onSuccess: () => {
          const name = child?.name;
          toast.success(
            `${name ? `Bravo ${name} ! ` : "Bravo ! "}${reward.icon || "🎁"} ${reward.name}`,
            {
              description: `-${reward.starsRequired} ⭐ · Profite bien !`,
              duration: 4000,
            }
          );
        },
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

      {/* Next reward goalpost */}
      {nextLockedReward && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 px-3 py-2.5">
          <span className="text-2xl shrink-0" aria-hidden="true">
            {nextLockedReward.icon || "🎁"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Prochaine récompense
            </p>
            <p className="text-sm font-semibold truncate">
              {nextLockedReward.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-none">
              {starsUntilNext}
            </p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
              ⭐ à gagner
            </p>
          </div>
        </div>
      )}

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
          {sortedRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              availableStars={availableStars}
              onStartEdit={() => setEditingReward(reward)}
              onClaim={() => handleClaim(reward)}
              onDelete={() =>
                deleteReward.mutate({ id: reward.id, childId })
              }
              claimPending={claimReward.isPending}
              deletePending={deleteReward.isPending}
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={editingReward !== null}
        onOpenChange={(open) => !open && setEditingReward(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la récompense</DialogTitle>
          </DialogHeader>
          {editingReward && (
            <RewardForm
              childId={childId}
              reward={editingReward}
              onSuccess={() => setEditingReward(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reward Card ─────────────────────────────────────────

function RewardCard({
  reward,
  availableStars,
  onStartEdit,
  onClaim,
  onDelete,
  claimPending,
  deletePending,
}: {
  reward: BarkleyReward;
  availableStars: number;
  onStartEdit: () => void;
  onClaim: () => void;
  onDelete: () => void;
  claimPending: boolean;
  deletePending: boolean;
}) {
  const starsNeeded = reward.starsRequired ?? 0;
  const isUnlockable = availableStars >= starsNeeded;
  const progress =
    starsNeeded > 0 ? Math.min((availableStars / starsNeeded) * 100, 100) : 100;
  const remaining = Math.max(starsNeeded - availableStars, 0);
  const timesClaimed = reward.timesClaimed ?? 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        isUnlockable
          ? "border-amber-300 bg-gradient-to-b from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 dark:border-amber-800/30 ring-2 ring-amber-400/50"
          : "opacity-75"
      }`}
    >
      <CardContent className="py-3 px-3 sm:py-4 sm:px-4">
        <div className="flex items-start gap-2 sm:gap-3">
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
                      ? "Encore une fois !"
                      : "Débloquer !"}
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Reward Form (create + edit dialog) ─────────────────

function RewardForm({
  childId,
  reward,
  onSuccess,
}: {
  childId: string;
  reward?: BarkleyReward;
  onSuccess: () => void;
}) {
  const createReward = useCreateBarkleyReward();
  const updateReward = useUpdateBarkleyReward();
  const isEdit = reward !== undefined;
  const mutation = isEdit ? updateReward : createReward;
  const [name, setName] = useState(reward?.name ?? "");
  const [icon, setIcon] = useState(reward?.icon ?? "");
  const [starsRequired, setStarsRequired] = useState(
    reward?.starsRequired ?? 5
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const safeStar = Number.isFinite(starsRequired) ? starsRequired : 0;
    if (isEdit && reward) {
      updateReward.mutate(
        {
          id: reward.id,
          childId,
          name: name.trim(),
          icon: icon || undefined,
          starsRequired: safeStar,
        },
        {
          onSuccess,
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Erreur lors de la mise à jour"
            );
          },
        }
      );
    } else {
      createReward.mutate(
        {
          childId,
          name: name.trim(),
          starsRequired: safeStar,
          icon: icon || undefined,
        },
        { onSuccess }
      );
    }
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
        disabled={!name || mutation.isPending}
      >
        {mutation.isPending
          ? "Enregistrement..."
          : isEdit
            ? "Enregistrer"
            : "Ajouter"}
      </Button>
    </form>
  );
}
