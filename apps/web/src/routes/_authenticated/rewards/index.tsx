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
    // Claimed last, then by starsRequired ascending
    if (a.claimedAt && !b.claimedAt) return 1;
    if (!a.claimedAt && b.claimedAt) return -1;
    return (a.starsRequired ?? 0) - (b.starsRequired ?? 0);
  });

  if (rewardsLoading || starsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Hero header with star count */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 95}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
                opacity: 0.4 + Math.random() * 0.6,
              }}
            >
              {i % 2 === 0 ? "⭐" : "🎁"}
            </span>
          ))}
        </div>
        <div className="relative text-center">
          <h1 className="text-2xl font-bold font-heading">
            <Trophy className="inline-block h-6 w-6 mr-2 -mt-1" />
            Récompenses de {childName}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
              <span className="text-xl font-bold">{totalStars}</span>
              <span className="text-sm text-white/80">étoiles gagnées</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add reward button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          Tableau de récompenses
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
        <Label htmlFor="reward-icon">Icône (emoji)</Label>
        <Input
          id="reward-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Ex: 🎨"
          maxLength={10}
        />
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
