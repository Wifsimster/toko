import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useSymptoms,
  useCreateSymptom,
  useUpdateSymptom,
} from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";

// Business rule B3: the evening check-in is the shortest data-entry path
// in the product. Three smileys cover the whole evening assessment, and
// a single sub-choice captures the pain point when the evening was hard.
// Total parent interaction: two taps, under two seconds.

const VIBES = [
  { id: "hard", emoji: "😵", mood: 2, agitation: 8 },
  { id: "ok",   emoji: "😐", mood: 6, agitation: 5 },
  { id: "top",  emoji: "😊", mood: 9, agitation: 2 },
] as const;

type Vibe = typeof VIBES[number]["id"];

// Sub-choices only surface when the parent reports a hard evening.
const PAIN_POINTS = ["shower", "homework", "bedtime", "meal"] as const;
type PainPoint = typeof PAIN_POINTS[number];

const NEUTRAL = {
  agitation: 5,
  focus: 5,
  impulse: 5,
  mood: 5,
  sleep: 5,
  routinesOk: true,
};

export function EveningCheck() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms } = useSymptoms(activeChildId ?? "");
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const [pendingVibe, setPendingVibe] = useState<Vibe | null>(null);

  const today = todayISO();
  const todayEntry = symptoms?.find((s) => s.date === today) ?? null;
  const isPending = createSymptom.isPending || updateSymptom.isPending;

  const persist = (vibe: typeof VIBES[number], painPoint: PainPoint | null) => {
    if (!activeChildId) return;

    const onSuccess = () => {
      setPendingVibe(null);
      toast.success(t("eveningCheck.saved"));
    };

    const patch = {
      mood: vibe.mood,
      agitation: vibe.agitation,
      context: painPoint ?? undefined,
      routinesOk: vibe.id !== "hard",
    };

    if (todayEntry) {
      updateSymptom.mutate(
        { id: todayEntry.id, childId: activeChildId, ...patch },
        { onSuccess }
      );
    } else {
      createSymptom.mutate(
        {
          childId: activeChildId,
          date: today,
          ...NEUTRAL,
          ...patch,
        },
        { onSuccess }
      );
    }
  };

  const handleVibe = (vibe: typeof VIBES[number]) => {
    if (vibe.id === "hard") {
      setPendingVibe("hard");
      return;
    }
    persist(vibe, null);
  };

  const handlePain = (point: PainPoint) => {
    const hard = VIBES.find((v) => v.id === "hard")!;
    persist(hard, point);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("eveningCheck.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {!pendingVibe && (
          <div className="flex items-center justify-between gap-3">
            {VIBES.map((v) => (
              <Button
                key={v.id}
                type="button"
                variant="outline"
                size="lg"
                disabled={isPending}
                onClick={() => handleVibe(v)}
                className="h-16 flex-1 flex-col gap-0.5 text-xs"
                aria-label={t(`eveningCheck.vibe_${v.id}`)}
              >
                <span className="text-2xl leading-none">{v.emoji}</span>
                <span>{t(`eveningCheck.vibe_${v.id}`)}</span>
              </Button>
            ))}
          </div>
        )}
        {pendingVibe === "hard" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("eveningCheck.painPrompt")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_POINTS.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handlePain(p)}
                >
                  {t(`eveningCheck.pain_${p}`)}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setPendingVibe(null)}
            >
              {t("eveningCheck.cancel")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
