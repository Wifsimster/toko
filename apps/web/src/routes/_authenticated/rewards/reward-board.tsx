import { useState, lazy, Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  Star,
  Baby,
  Settings,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBarkleyRewards,
  useDeleteBarkleyReward,
  useBarkleyStarCount,
  useClaimBarkleyReward,
} from "@/hooks/use-barkley";
import { useChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import { RewardCard } from "./reward-card";
import { rewardGoal } from "./reward-goal";
import { Mo } from "@/components/mo/mo";
import { RewardForm } from "./reward-form";
import type { BarkleyReward } from "@focusflow/validators";

const BehaviorTracking = lazy(() =>
  import("@/components/barkley/behavior-tracking").then((m) => ({
    default: m.BehaviorTracking,
  })),
);

export function RewardBoard({ childId }: { childId: string }) {
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

  const goal = rewardGoal(rewards, availableStars);
  const sortedRewards = rewards.toSorted(
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
          toast.success(`${prefix}${reward.name}`, {
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
        title={child?.name ? t("rewards.boardTitle", { name: child.name }) : t("rewards.title")}
        description={t("rewards.boardSubtitle")}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={toggleKidView}>
              {kidView ? (
                <>
                  <Settings className="mr-1.5 size-4" />
                  {t("rewards.parentView")}
                </>
              ) : (
                <>
                  <Baby className="mr-1.5 size-4" />
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
                      <Plus className="mr-2 size-4" />
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

      <section
        aria-labelledby="reward-stars"
        className="relative overflow-hidden rounded-[28px] border border-honey-border bg-surface-honey p-5"
      >
        <Mo state="theme-recompenses" size={120} className="absolute right-2 bottom-1 sm:right-4" />
        <p aria-hidden="true" className="font-hand text-[21px] leading-none font-semibold text-honey-foreground">
          {t("rewards.heroKicker")}
        </p>
        <h2 id="reward-stars" className="mt-1 flex items-center gap-2 text-[40px] leading-none font-extrabold tabular-nums">
          {availableStars}
          <Star className="size-8 fill-status-warning text-status-warning" aria-hidden="true" />
          <span className="sr-only">{t("rewards.starsAvailable", { count: availableStars })}</span>
        </h2>
        <p aria-hidden="true" className="mt-1 text-sm text-muted-foreground">
          {t("rewards.starsAvailable", { count: availableStars })}
        </p>
        {goal && (
          <div className="mt-3 max-w-[calc(100%-8rem)]">
            <p className="text-[0.9375rem] leading-snug">
              {goal.kind === "next"
                ? t("rewards.goalNext", { count: goal.missing, name: goal.reward.name })
                : t("rewards.goalReady", { name: goal.reward.name })}
            </p>
            {goal.kind === "next" && (
              <div
                role="progressbar"
                aria-label={t("rewards.goalProgress", { name: goal.reward.name })}
                aria-valuemin={0}
                aria-valuemax={goal.reward.starsRequired}
                aria-valuenow={availableStars}
                className="mt-2 h-2.5 overflow-hidden rounded-full border border-honey-border bg-card"
              >
                <span className="block h-full rounded-full bg-honey-300" style={{ width: `${Math.round(goal.progress * 100)}%` }} />
              </div>
            )}
          </div>
        )}
        {!kidView && (
          <p className="mt-3 text-xs text-muted-foreground tabular-nums">
            {t("rewards.earned")} {totalStars} · {t("rewards.spent")} {spentStars}
          </p>
        )}
      </section>

      {!kidView && (
        <Suspense
          fallback={<div className="h-48 animate-pulse rounded-lg bg-muted/40" />}
        >
          <BehaviorTracking childId={childId} />
        </Suspense>
      )}

      {sortedRewards.length === 0 ? (
        <EmptyState title={t("rewards.emptyTitle")} description={t("rewards.emptyBody")} />
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
