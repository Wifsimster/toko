import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
  Baby,
  Settings,
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

// ─── Page ────────────────────────────────────────────────

function RewardsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("rewards.title")}</h1>
          <p className="text-muted-foreground">{t("rewards.subtitle")}</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("rewards.selectChild")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <RewardBoard childId={activeChildId} />;
}

// ─── Board ───────────────────────────────────────────────

function RewardBoard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const kidView = useUiStore((s) => s.rewardsKidView);
  const toggleKidView = useUiStore((s) => s.toggleRewardsKidView);
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
          const prefix = name
            ? t("rewards.claimToastPrefixWithName", { name })
            : t("rewards.claimToastPrefix");
          toast.success(
            `${prefix}${reward.icon || "🎁"} ${reward.name}`,
            {
              description: t("rewards.claimToastDescription", {
                stars: reward.starsRequired,
              }),
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
      {/* View mode toggle */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleKidView}
          className="text-xs text-muted-foreground gap-1.5"
        >
          {kidView ? (
            <>
              <Settings className="h-3.5 w-3.5" />
              {t("rewards.parentView")}
            </>
          ) : (
            <>
              <Baby className="h-3.5 w-3.5" />
              {t("rewards.kidView")}
            </>
          )}
        </Button>
      </div>

      {/* Weekly behavior tracking grid — parent view only */}
      {!kidView && <BehaviorTracking childId={childId} />}

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
              {t("rewards.starsAvailable", { count: availableStars })}
            </span>
          </div>
          {!kidView && (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-amber-600/70 dark:text-amber-400/70 tabular-nums">
              <span>{t("rewards.earned")} : {totalStars}</span>
              <span aria-hidden="true">·</span>
              <span>{t("rewards.spent")} : {spentStars}</span>
              {reachableCount > 0 && sortedRewards.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium">
                    {reachableCount} {t("rewards.toUnlock")}
                  </span>
                </>
              )}
            </div>
          )}
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
              {t("rewards.nextReward")}
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
              {t("rewards.starsToEarn")}
            </p>
          </div>
        </div>
      )}

      {/* Reward section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          {t("rewards.unlockableTitle")}
        </h2>
        {!kidView && (
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
                <DialogTitle>{t("rewards.newReward")}</DialogTitle>
              </DialogHeader>
              <RewardForm
                childId={childId}
                onSuccess={() => setRewardDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reward cards */}
      {sortedRewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium">{t("rewards.emptyTitle")}</p>
            <p className="text-sm mt-1">{t("rewards.emptyBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sortedRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              availableStars={availableStars}
              kidView={kidView}
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
            <DialogTitle>{t("rewards.editReward")}</DialogTitle>
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
  kidView,
  onStartEdit,
  onClaim,
  onDelete,
  claimPending,
  deletePending,
}: {
  reward: BarkleyReward;
  availableStars: number;
  kidView: boolean;
  onStartEdit: () => void;
  onClaim: () => void;
  onDelete: () => void;
  claimPending: boolean;
  deletePending: boolean;
}) {
  const { t } = useTranslation();
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

                {/* Actions — parent view only */}
                {!kidView && (
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
                )}
              </div>

              {/* Star requirement */}
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  {starsNeeded === 0
                    ? "Gratuite"
                    : isUnlockable
                      ? t("rewards.costsStars", { count: starsNeeded })
                      : t("rewards.starsRemaining", { count: remaining })}
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
                    ? t("rewards.unlocking")
                    : timesClaimed > 0
                      ? "Encore une fois !"
                      : t("rewards.unlock")}
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
  const { t } = useTranslation();
  const REWARD_SUGGESTIONS = t("rewardSuggestions", { returnObjects: true }) as {
    icon: string;
    name: string;
  }[];
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
              err instanceof Error ? err.message : t("rewards.updateError")
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
        <Label htmlFor="reward-name">{t("rewards.nameLabel")}</Label>
        <InputGroup>
          <EmojiPicker value={icon} onSelect={setIcon} />
          <InputGroupInput
            id="reward-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("rewards.namePlaceholder")}
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
              <TooltipContent>{t("rewards.randomSuggestion")}</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reward-stars">{t("rewards.starsNeededLabel")}</Label>
        <Input
          id="reward-stars"
          type="number"
          min={0}
          value={starsRequired}
          onChange={(e) => setStarsRequired(Number(e.target.value))}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t("rewards.starsNeededHelp")}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {showSuggestions ? t("rewards.hideIdeas") : t("rewards.showIdeas")}
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
