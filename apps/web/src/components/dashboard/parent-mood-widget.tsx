import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Mo } from "@/components/mo/mo";
import { PARENT_MOOD_FACES, PARENT_MOOD_SCORES } from "@/components/mo/parent-mood-faces";
import {
  useParentMoodHistory,
  useUpsertParentMood,
} from "@/hooks/use-parent-mood";
import { cn } from "@/lib/utils";
import { toISODate, todayISO } from "@/lib/date";



// Build the last 7 calendar days, oldest → newest.
function last7Days(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
}

export function ParentMoodWidget() {
  const { t } = useTranslation();
  const { data: history } = useParentMoodHistory();
  const upsert = useUpsertParentMood();

  const today = todayISO();
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
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-foreground">
              {t("parentMood.eyebrow")}
            </p>
            <p className="text-sm leading-snug text-muted-foreground">
              {todayLog
                ? t("parentMood.titleLogged")
                : t("parentMood.titlePrompt")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {PARENT_MOOD_SCORES.map((score) => {
            const active = todayLog?.score === score;
            const face = PARENT_MOOD_FACES[score];
            return (
              <button
                key={score}
                type="button"
                onClick={() => log(score)}
                disabled={upsert.isPending}
                aria-pressed={active}
                className={cn(
                  "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                  active ? cn(face.surface, "ring-2 ring-foreground") : "hover:bg-muted",
                  upsert.isPending && "opacity-50",
                )}
              >
                <Mo state={face.state} size={44} />
                <span className="w-full text-center text-[11px] leading-tight font-medium text-muted-foreground [overflow-wrap:anywhere]">
                  {t(`parentMood.scoreLabel.${score}`)}
                </span>
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
                      className="flex h-8 w-full items-end overflow-hidden rounded bg-muted"
                      title={
                        score
                          ? t(`parentMood.scoreLabel.${score}`)
                          : t("parentMood.noEntry")
                      }
                    >
                      <div
                        className={cn(
                          "w-full transition-all",
                          isToday ? "bg-brand" : "bg-muted-foreground/40",
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
