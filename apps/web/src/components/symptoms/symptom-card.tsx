import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useDeleteSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { Symptom } from "@focusflow/validators";

const DIMENSIONS = [
  { key: "mood", labelKey: "dimensions.moodShort", invert: false },
  { key: "focus", labelKey: "dimensions.focus", invert: false },
  { key: "sleep", labelKey: "dimensions.sleep", invert: false },
  { key: "agitation", labelKey: "dimensions.agitation", invert: true },
  { key: "impulse", labelKey: "dimensions.impulse", invert: true },
] as const;

// Overall day score on a 0-10 scale where 10 = best day.
// Agitation and impulse are inverted so "higher is always better".
function computeDayScore(s: Symptom): number {
  const sum = s.mood + s.focus + s.sleep + (10 - s.agitation) + (10 - s.impulse);
  return sum / 5;
}

type Level = "good" | "ok" | "hard";

function levelFromValue(value: number, invert: boolean): Level {
  const v = invert ? 10 - value : value;
  if (v >= 7) return "good";
  if (v >= 4) return "ok";
  return "hard";
}

const LEVEL_EMOJI: Record<Level, string> = {
  good: "😀",
  ok: "😐",
  hard: "😟",
};

const LEVEL_SUMMARY_CLASS: Record<Level, string> = {
  good: "bg-status-success/10 text-status-success",
  ok: "bg-status-warning/10 text-status-warning",
  hard: "bg-status-danger/10 text-status-danger",
};

const LEVEL_LABEL_KEY: Record<Level, string> = {
  good: "symptoms.dayGood",
  ok: "symptoms.dayMixed",
  hard: "symptoms.dayHard",
};

const LEVEL_ARIA_KEY: Record<Level, string> = {
  good: "symptoms.levelGood",
  ok: "symptoms.levelOk",
  hard: "symptoms.levelHard",
};

export function SymptomCard({
  symptom,
  onEdit,
}: {
  symptom: Symptom;
  onEdit: (symptom: Symptom) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const activeChildId = useUiStore((s) => s.activeChildId);
  const deleteSymptom = useDeleteSymptom();
  const [expanded, setExpanded] = useState(false);

  const score = computeDayScore(symptom);
  const dayLevel: Level = score >= 7 ? "good" : score >= 4 ? "ok" : "hard";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {new Date(symptom.date).toLocaleDateString(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
          <div className="flex items-center gap-1">
            {symptom.context && (
              <Badge variant="secondary">{symptom.context}</Badge>
            )}
            <button
              onClick={() => onEdit(symptom)}
              aria-label={t("common.edit")}
              className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    disabled={deleteSymptom.isPending}
                    aria-label={t("common.delete")}
                    className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("symptoms.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("symptoms.deleteBody")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("child.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      activeChildId &&
                      deleteSymptom.mutate({
                        id: symptom.id,
                        childId: activeChildId,
                      })
                    }
                  >
                    {t("child.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
            LEVEL_SUMMARY_CLASS[dayLevel],
          )}
        >
          <span className="text-3xl leading-none" aria-hidden="true">
            {LEVEL_EMOJI[dayLevel]}
          </span>
          <span className="flex-1 text-sm font-medium">
            {t(LEVEL_LABEL_KEY[dayLevel])}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-60 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
          <span className="sr-only">
            {expanded ? t("symptoms.hideDetails") : t("symptoms.showDetails")}
          </span>
        </button>

        {expanded && (
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 px-1">
            {DIMENSIONS.map(({ key, labelKey, invert }) => {
              const value = symptom[key as keyof Symptom] as number;
              const level = levelFromValue(value, invert);
              return (
                <div key={key} className="contents text-sm">
                  <span
                    className="text-xl leading-none"
                    role="img"
                    aria-label={t(LEVEL_ARIA_KEY[level])}
                  >
                    {LEVEL_EMOJI[level]}
                  </span>
                  <span className="self-center text-muted-foreground">
                    {t(labelKey)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex h-1.5 w-1.5 rounded-full",
              symptom.routinesOk ? "bg-status-success" : "bg-status-warning",
            )}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">
            {symptom.routinesOk
              ? t("symptoms.routinesKept")
              : t("symptoms.routinesComplicated")}
          </span>
        </div>
        {symptom.notes && (
          <p className="mt-2 text-sm text-muted-foreground">{symptom.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
