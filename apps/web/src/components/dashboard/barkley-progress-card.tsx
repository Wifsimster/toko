import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ClipboardList, ChevronRight, Trophy, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useStats } from "@/hooks/use-stats";
import { useUiStore } from "@/stores/ui-store";

export function BarkleyProgressCard() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: steps } = useBarkleySteps(activeChildId ?? "");
  const { data: stats } = useStats(activeChildId ?? "", "week");

  if (!activeChildId || !steps) return null;

  const completedSteps = steps.filter((s) => s.completedAt).length;
  const totalSteps = 8;
  const currentStep = Math.min(completedSteps + 1, totalSteps);
  const weeklyStars = stats?.weeklyStars ?? 0;

  if (completedSteps === 0 && weeklyStars === 0) return null;

  return (
    <Link
      to="/barkley"
      className="block rounded-xl"
    >
      <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            {t("barkleyProgress.title")}
          </CardTitle>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-accent-500" />
              <span className="text-sm font-medium">
                {t("barkleyProgress.step", { current: currentStep, total: totalSteps })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-status-warning" />
              <span className="text-sm font-medium">
                {t("barkleyProgress.stars", { count: weeklyStars })}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
