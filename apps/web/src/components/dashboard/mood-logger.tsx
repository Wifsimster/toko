import { useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useSymptoms,
  useCreateSymptom,
  useUpdateSymptom,
} from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";
import type { Symptom } from "@focusflow/validators";

// 4-point mood emoji → 0-10 mood scale (symptom.mood)
const moods = [
  { emoji: "😢", label: "Difficile", value: 2 },
  { emoji: "😐", label: "Moyen", value: 5 },
  { emoji: "🙂", label: "Bien", value: 7 },
  { emoji: "😄", label: "Super", value: 9 },
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
    return [...symptoms].sort((a, b) => b.date.localeCompare(a.date))[0]!;
  }, [symptoms]);

  const isPending = createSymptom.isPending || updateSymptom.isPending;
  // Optimistic value in-flight — pulled from the live mutation variables so
  // no duplicate local state is needed.
  const inFlightMood =
    createSymptom.variables?.mood ?? updateSymptom.variables?.mood ?? null;
  const storedMood = todayEntry?.mood ?? null;
  const displayedMood = isPending ? inFlightMood : storedMood;

  const handleSelect = (moodValue: number) => {
    if (!activeChildId) return;

    if (todayEntry) {
      updateSymptom.mutate(
        { id: todayEntry.id, childId: activeChildId, mood: moodValue },
        { onSuccess: () => toast.success("Humeur enregistrée") }
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
        { onSuccess: () => toast.success("Humeur enregistrée") }
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
        <CardTitle className="text-base">Comment va-t-il aujourd'hui ?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              disabled={isPending || !activeChildId}
              onClick={() => handleSelect(mood.value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all hover:bg-accent sm:px-4 sm:py-3 disabled:opacity-50 ${
                isActive(mood.value)
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "bg-muted/50"
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
