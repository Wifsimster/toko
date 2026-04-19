import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Gift,
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
import { PageHeader } from "@/components/layout/page-header";
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
  staticData: { crumb: "nav.rewards" },
});

// ─── Page ────────────────────────────────────────────────

function RewardsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("rewards.title")}
          description={t("rewards.subtitle")}
        />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p>{t("rewards.selectChild")}</p>
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
  const [editingReward, setEditingReward] = useState<BarkleyReward | null>(
    null
  );
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

  const sortedRewards = [...rewards].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const handleClaim = (reward: BarkleyReward) => {
    claimReward.mutate(
      { id: reward.id, childId },
      {
        onSuccess: () => {
          const name = child?.name;
          const prefix = name
            ? t("rewards.claimToastPrefixWithName", { name })
            : t("rewards.claimToastPrefix");
          toast.success(`${prefix}${reward.icon || "🎁"} ${reward.name}`, {
            description: t("rewards.claimToastDescription", {
              stars: reward.starsRequired,
            }),
            duration: 4000,
          });
        },
      }
    );
  };

  if (rewardsLoading || starsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("rewards.title")}
        description={t("rewards.subtitle")}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={toggleKidView}>
              {kidView ? (
                <>
                  <Settings className="mr-1.5 h-4 w-4" />
                  {t("rewards.parentView")}
                </>
              ) : (
                <>
                  <Baby className="mr-1.5 h-4 w-4" />
                  {t("rewards.kidView")}
                </>
              )}
            </Button>
            {!kidView && (
              <Dialog
                open={rewardDialogOpen}
                onOpenChange={setRewardDialogOpen}
              >
                <DialogTrigger
                  render={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("rewards.addButton")}
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
          </>
        }
      />

      {/* Behavior tracking — parent only */}
      {!kidView && <BehaviorTracking childId={childId} />}

      {/* Star balance — clean centered hero number */}
      <div className="flex flex-col items-center gap-1 py-4">
        <div className="flex items-baseline gap-2">
          <Star className="h-5 w-5 fill-status-warning text-status-warning self-center" />
          <span className="text-4xl font-bold tabular-nums">
            {availableStars}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("rewards.starsAvailable", { count: availableStars })}
        </p>
        {!kidView && (
          <p className="text-xs text-muted-foreground/70 tabular-nums">
            {t("rewards.earned")} {totalStars} · {t("rewards.spent")}{" "}
            {spentStars}
          </p>
        )}
      </div>

      {/* Reward list */}
      {sortedRewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
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
    starsNeeded > 0
      ? Math.min((availableStars / starsNeeded) * 100, 100)
      : 100;
  const remaining = Math.max(starsNeeded - availableStars, 0);
  const timesClaimed = reward.timesClaimed ?? 0;

  return (
    <Card
      className={
        isUnlockable
          ? "transition-all hover:shadow-md"
          : "opacity-60 transition-all"
      }
    >
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-4">
          {/* Large emoji — friendly for kids */}
          <span
            className="text-3xl sm:text-4xl shrink-0 leading-none"
            aria-hidden="true"
          >
            {reward.icon || "🎁"}
          </span>

          {/* Center content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{reward.name}</h3>

            {/* Cost line */}
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-status-warning text-status-warning shrink-0" />
              {starsNeeded === 0 ? (
                <span>{t("rewards.free")}</span>
              ) : isUnlockable ? (
                <span>{starsNeeded}</span>
              ) : (
                <span>
                  {availableStars} / {starsNeeded}
                </span>
              )}
              {timesClaimed > 0 && (
                <span className="text-xs text-muted-foreground/60">
                  · x{timesClaimed}
                </span>
              )}
            </div>

            {/* Progress — only for locked rewards with a cost */}
            {!isUnlockable && starsNeeded > 0 && (
              <div className="mt-2">
                <Progress value={progress}>
                  <ProgressValue>
                    {() => `${remaining} ${t("rewards.starsRemaining", { count: remaining })}`}
                  </ProgressValue>
                </Progress>
              </div>
            )}
          </div>

          {/* Right side: claim button OR parent actions */}
          <div className="shrink-0 flex items-center gap-1">
            {isUnlockable && (
              <Button
                size="sm"
                onClick={onClaim}
                disabled={claimPending}
              >
                <PartyPopper className="mr-1.5 h-3.5 w-3.5" />
                {claimPending
                  ? t("rewards.unlocking")
                  : timesClaimed > 0
                    ? t("rewards.unlockAgain")
                    : t("rewards.unlock")}
              </Button>
            )}
            {!kidView && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onStartEdit}
                  aria-label={t("rewards.editLabel")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                  aria-label={t("rewards.deleteLabel")}
                  disabled={deletePending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Reward Form ─────────────────────────────────────────

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
  const REWARD_SUGGESTIONS = t("rewardSuggestions", {
    returnObjects: true,
  }) as { icon: string; name: string }[];
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

  const handlePickSuggestion = (s: { icon: string; name: string }) => {
    setIcon(s.icon);
    setName(s.name);
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
        <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto rounded-lg border p-2">
          {REWARD_SUGGESTIONS.map((s) => (
            <Button
              key={s.name}
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-auto py-2.5"
              onClick={() => handlePickSuggestion(s)}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </Button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!name || mutation.isPending}
      >
        {mutation.isPending
          ? t("rewards.saving")
          : isEdit
            ? t("rewards.save")
            : t("rewards.add")}
      </Button>
    </form>
  );
}
