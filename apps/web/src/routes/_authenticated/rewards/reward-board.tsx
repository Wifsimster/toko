import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Gift,
  Plus,
  Star,
  Baby,
  Settings,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Behavior tracking — parent only (lazy: dnd-kit lives here) */}
      {!kidView && (
        <Suspense
          fallback={<div className="h-48 animate-pulse rounded-lg bg-muted/40" />}
        >
          <BehaviorTracking childId={childId} />
        </Suspense>
      )}

      {/* Star balance — clean centered hero number */}
      <div className="flex flex-col items-center gap-1 py-4">
        <div className="flex items-baseline gap-2">
          <Star className="size-5 fill-status-warning text-status-warning self-center" />
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
            <Gift className="mx-auto mb-3 size-10 text-muted-foreground/50" />
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
