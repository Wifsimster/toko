import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Gift,
  Lock,
  Plus,
  Star,
  Trash2,
  Trophy,
  PartyPopper,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressValue } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useDeleteBarkleyReward,
  useBarkleyStarCount,
  useClaimBarkleyReward,
} from "@/hooks/use-barkley";
import { useChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import { BehaviorTracking } from "@/components/barkley/behavior-tracking";

export const Route = createFileRoute("/_authenticated/rewards/")({
  component: RewardsPage,
});

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

function RewardBoard({ childId }: { childId: string }) {
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const { data: child } = useChild(childId);
  const { data: rewards = [], isLoading: rewardsLoading } =
    useBarkleyRewards(childId);
  const { data: starData, isLoading: starsLoading } =
    useBarkleyStarCount(childId);
  const claimReward = useClaimBarkleyReward();
  const deleteReward = useDeleteBarkleyReward();

  const totalStars = starData?.totalStars ?? 0;
  const childName = child?.name ?? "...";

  const sortedRewards = [...rewards].sort((a, b) => {
    if (a.claimedAt && !b.claimedAt) return 1;
    if (!a.claimedAt && b.claimedAt) return -1;
    return (a.starsRequired ?? 0) - (b.starsRequired ?? 0);
  });

  if (rewardsLoading || starsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Weekly behavior tracking grid */}
      <BehaviorTracking childId={childId} />

      {/* Visual connector: stars unlock rewards */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700" />
        <div className="flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 px-4 py-2 border border-amber-200/60 dark:border-amber-800/40">
          <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{totalStars}</span>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/80">étoiles au total</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700" />
      </div>

      {/* Reward section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          Récompenses à débloquer
        </h2>
        <Dialog
          open={rewardDialogOpen}
          onOpenChange={setRewardDialogOpen}
        >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRewards.map((reward) => {
            const starsNeeded = reward.starsRequired ?? 0;
            const isClaimed = !!reward.claimedAt;
            const isUnlockable = !isClaimed && totalStars >= starsNeeded;
            const progress =
              starsNeeded > 0
                ? Math.min((totalStars / starsNeeded) * 100, 100)
                : 100;
            const remaining = Math.max(starsNeeded - totalStars, 0);

            return (
              <Card
                key={reward.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isClaimed
                    ? "border-green-300 bg-gradient-to-b from-green-50/80 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 dark:border-green-800/30"
                    : isUnlockable
                      ? "border-amber-300 bg-gradient-to-b from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 dark:border-amber-800/30 ring-2 ring-amber-400/50"
                      : "opacity-75"
                }`}
              >
                <CardContent className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                        isClaimed
                          ? "bg-green-100 dark:bg-green-900/30"
                          : isUnlockable
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-muted grayscale"
                      }`}
                    >
                      {reward.icon || "🎁"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">
                          {reward.name}
                        </h3>
                        {isClaimed && (
                          <PartyPopper className="h-4 w-4 text-green-600 shrink-0" />
                        )}
                        {!isClaimed && !isUnlockable && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        )}
                      </div>

                      {/* Star requirement */}
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>
                          {isClaimed
                            ? `Débloquée !`
                            : isUnlockable
                              ? `Prête à débloquer !`
                              : `${remaining} étoile${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {!isClaimed && starsNeeded > 0 && (
                        <div className="mt-2">
                          <Progress value={progress}>
                            <ProgressValue>
                              {() =>
                                `${Math.min(totalStars, starsNeeded)} / ${starsNeeded}`
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
                          onClick={() =>
                            claimReward.mutate({
                              id: reward.id,
                              childId,
                            })
                          }
                          disabled={claimReward.isPending}
                        >
                          <PartyPopper className="mr-1.5 h-3.5 w-3.5" />
                          {claimReward.isPending
                            ? "Déblocage..."
                            : "Débloquer !"}
                        </Button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        deleteReward.mutate({ id: reward.id, childId })
                      }
                      className="text-muted-foreground/30 hover:text-destructive transition-colors p-1 rounded shrink-0"
                      disabled={deleteReward.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const REWARD_EMOJIS = [
  "🎁", "🏆", "🎨", "🎮", "🍦", "🎬", "🎵", "📚", "🐾", "⚽",
  "🎯", "🌈", "🍕", "🎂", "🚲", "🎸", "🛝", "🎪", "🧸", "🌟",
  "🎠", "🍫", "🎧", "🏊", "🎳",
];

// ─── Reward Form ──────────────────────────────────────────

function RewardForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const createReward = useCreateBarkleyReward();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [starsRequired, setStarsRequired] = useState(5);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reward-name">Nom de la récompense</Label>
        <Input
          id="reward-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Un temps de dessin avec maman"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Icône (emoji)</Label>
        <Select value={icon || undefined} onValueChange={(v) => v && setIcon(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir un emoji 🎁" />
          </SelectTrigger>
          <SelectContent>
            {REWARD_EMOJIS.map((e) => (
              <SelectItem key={e} value={e} label={e}>
                <span className="text-xl">{e}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          Nombre d'étoiles cumulées pour débloquer cette récompense.
        </p>
      </div>
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
