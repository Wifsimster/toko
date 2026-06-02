import { useTranslation } from "react-i18next";
import { Star, PartyPopper, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressValue } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { BarkleyReward } from "@focusflow/validators";

export function RewardCard({
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
      <CardContent className="p-4">
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
              <Star className="size-3.5 fill-status-warning text-status-warning shrink-0" />
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
                <PartyPopper className="mr-1.5 size-3.5" />
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
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={t("rewards.deleteLabel")}
                        disabled={deletePending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("rewards.deleteTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("rewards.deleteBody", { name: reward.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("rewards.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>
                        {t("rewards.deleteLabel")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
