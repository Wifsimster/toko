import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useParentMoodHistory,
  useUpsertParentMood,
} from "@/hooks/use-parent-mood";
import { cn } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5] as const;

const EMOJI: Record<number, string> = {
  1: "😩",
  2: "😟",
  3: "😐",
  4: "🙂",
  5: "😄",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Build the last 7 calendar days, oldest → newest.
function last7Days(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function ParentMoodWidget() {
  const { t } = useTranslation();
  const { data: history } = useParentMoodHistory();
  const upsert = useUpsertParentMood();

  const today = todayIso();
  const todayLog = useMemo(
    () => history?.find((h) => h.date === today) ?? null,
    [history, today],
  );

  const scoreByDate = useMemo(() => {
    const map = new Map<string, number>();
    history?.forEach((h) => map.set(h.date, h.score));
    return map;
  }, [history]);

  const days = last7Days();

  const log = (score: number) => {
    upsert.mutate(
      { date: today, score },
      {
        onSuccess: () =>
          toast.success(t("parentMood.saved"), {
            description: t(`parentMood.scoreLabel.${score}`),
          }),
      },
    );
  };

  return (
    <Card className="border-info-border bg-info-surface">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-info-foreground">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-info-foreground/80">
              {t("parentMood.eyebrow")}
            </p>
            <p className="font-heading text-base font-semibold leading-snug text-foreground">
              {todayLog
                ? t("parentMood.titleLogged")
                : t("parentMood.titlePrompt")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {SCORES.map((score) => {
            const active = todayLog?.score === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => log(score)}
                disabled={upsert.isPending}
                aria-label={t(`parentMood.scoreLabel.${score}`)}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center rounded-xl text-2xl transition-all",
                  active
                    ? "bg-background ring-2 ring-primary scale-105 shadow-sm"
                    : "bg-background/50 hover:bg-background hover:scale-105",
                  upsert.isPending && "opacity-50",
                )}
              >
                {EMOJI[score]}
              </button>
            );
          })}
        </div>

        {history && history.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              {t("parentMood.last7Days")}
            </p>
            <div className="flex items-end justify-between gap-1">
              {days.map((d) => {
                const score = scoreByDate.get(d) ?? null;
                const heightPct = score ? (score / 5) * 100 : 0;
                const isToday = d === today;
                return (
                  <div
                    key={d}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="flex h-8 w-full items-end overflow-hidden rounded bg-background/40"
                      title={
                        score
                          ? t(`parentMood.scoreLabel.${score}`)
                          : t("parentMood.noEntry")
                      }
                    >
                      <div
                        className={cn(
                          "w-full transition-all",
                          isToday ? "bg-primary" : "bg-info-foreground/40",
                        )}
                        style={{ height: `${heightPct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
