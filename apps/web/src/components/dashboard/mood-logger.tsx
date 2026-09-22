import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useSymptoms,
  useCreateSymptom,
  useUpdateSymptom,
} from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";
import { isOptimisticId } from "@/lib/query/optimistic-list";
import type { Symptom } from "@focusflow/validators";

// 4-point mood emoji → 0-10 mood scale (symptom.mood)
const moods = [
  { emoji: "😢", labelKey: "moods.difficult", value: 2 },
  { emoji: "😐", labelKey: "moods.average", value: 5 },
  { emoji: "🙂", labelKey: "moods.good", value: 7 },
  { emoji: "😄", labelKey: "moods.great", value: 9 },
] as const;

const NEUTRAL = {
  agitation: 5,
  focus: 5,
  impulse: 5,
  mood: 5,
  sleep: 5,
  routinesOk: true,
};

export function MoodLogger() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms } = useSymptoms(activeChildId ?? "");
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const today = todayISO();

  const todayEntry = useMemo<Symptom | null>(() => {
    if (!symptoms) return null;
    return symptoms.find((s) => s.date === today) ?? null;
  }, [symptoms, today]);

  const latestEntry = useMemo<Symptom | null>(() => {
    if (!symptoms || symptoms.length === 0) return null;
    return symptoms.reduce((latest, s) =>
      s.date.localeCompare(latest.date) > 0 ? s : latest
    );
  }, [symptoms]);

  // Until today's list is known we can't tell create from update — a tap
  // now would create a duplicate entry for today. Same while the created
  // row still carries its optimistic id (not yet saved server-side).
  const notReady =
    symptoms === undefined || (!!todayEntry && isOptimisticId(todayEntry.id));
  const isPending = createSymptom.isPending || updateSymptom.isPending;
  // Only the mutation actually in flight: `variables` outlives success, so
  // reading a settled create would show its stale mood during an update.
  const inFlightMood = updateSymptom.isPending
    ? (updateSymptom.variables?.mood ?? null)
    : createSymptom.isPending
      ? (createSymptom.variables?.mood ?? null)
      : null;
  const storedMood = todayEntry?.mood ?? null;
  const displayedMood = isPending ? inFlightMood : storedMood;

  const handleSelect = (moodValue: number) => {
    if (!activeChildId || notReady) return;

    if (todayEntry) {
      updateSymptom.mutate(
        { id: todayEntry.id, childId: activeChildId, mood: moodValue },
        { onSuccess: () => toast.success(t("moods.saved")) }
      );
    } else {
      const baseline = latestEntry
        ? {
            agitation: latestEntry.agitation,
            focus: latestEntry.focus,
            impulse: latestEntry.impulse,
            sleep: latestEntry.sleep,
            routinesOk: latestEntry.routinesOk,
          }
        : NEUTRAL;
      createSymptom.mutate(
        { childId: activeChildId, date: today, ...baseline, mood: moodValue },
        { onSuccess: () => toast.success(t("moods.saved")) }
      );
    }
  };

  const isActive = (moodValue: number) => {
    if (displayedMood === null) return false;
    const closest = moods.reduce((best, m) =>
      Math.abs(m.value - displayedMood) < Math.abs(best.value - displayedMood)
        ? m
        : best
    );
    return closest.value === moodValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("moods.logTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              type="button"
              disabled={isPending || notReady || !activeChildId}
              onClick={() => handleSelect(mood.value)}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all hover:bg-accent active:scale-[0.97] sm:px-4 sm:py-3 disabled:opacity-50 ${
                isActive(mood.value)
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "bg-muted/50"
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {t(mood.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
