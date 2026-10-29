import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MoodBadge } from "@/components/mo/mood-badge";
import { EntryCard } from "@/components/shared/entry-card";
import { CreatedByLabel } from "@/components/shared/created-by-label";
import { useDeleteSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { parseISODate } from "@/lib/date";
import type { Symptom } from "@focusflow/validators";
import {
  DAY_LEVEL_SURFACE,
  computeDayScore,
  levelFromScore,
  levelFromValue,
  type DayLevel,
} from "./day-level";

const DIMENSIONS = [
  { key: "mood", labelKey: "dimensions.moodShort", invert: false },
  { key: "focus", labelKey: "dimensions.focus", invert: false },
  { key: "sleep", labelKey: "dimensions.sleep", invert: false },
  { key: "agitation", labelKey: "dimensions.agitation", invert: true },
  { key: "impulse", labelKey: "dimensions.impulse", invert: true },
] as const;

const LEVEL_LABEL_KEY: Record<DayLevel, string> = {
  good: "symptoms.dayGood",
  ok: "symptoms.dayMixed",
  hard: "symptoms.dayHard",
};

const LEVEL_SHORT_KEY: Record<DayLevel, string> = {
  good: "symptoms.levelGood",
  ok: "symptoms.levelOk",
  hard: "symptoms.levelHard",
};

const ACTION_CLASS = "size-11 md:size-11 text-muted-foreground hover:text-foreground";

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

  const dayLevel = levelFromScore(computeDayScore(symptom));
  const dateLabel = parseISODate(symptom.date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const detailsId = `symptom-details-${symptom.id}`;

  return (
    <EntryCard
      title={dateLabel}
      meta={
        <>
          <CreatedByLabel name={symptom.createdByName} className="mt-0 text-[0.8125rem]" />
          {symptom.context && (
            <span
              title={symptom.context}
              className="line-clamp-2 max-w-full rounded-lg bg-card px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-border [overflow-wrap:anywhere]"
            >
              {symptom.context}
            </span>
          )}
        </>
      }
      actions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(symptom)}
            aria-label={t("symptoms.editAria", { date: dateLabel })}
            className={ACTION_CLASS}
          >
            <Pencil className="size-[18px]" aria-hidden="true" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deleteSymptom.isPending}
                  aria-label={t("symptoms.deleteAria", { date: dateLabel })}
                  className={cn(ACTION_CLASS, "hover:text-destructive")}
                >
                  <Trash2 className="size-[18px]" aria-hidden="true" />
                </Button>
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
        </>
      }
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        data-level={dayLevel}
        className="block w-full rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <MoodBadge
          mo={false}
          surface={DAY_LEVEL_SURFACE[dayLevel]}
          label={
            <>
              {t(LEVEL_LABEL_KEY[dayLevel])}
              <span className="sr-only">
                {" · "}
                {expanded ? t("symptoms.hideDetails") : t("symptoms.showDetails")}
              </span>
            </>
          }
          trailing={
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          }
        />
      </button>

      {expanded && (
        <dl
          id={detailsId}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-1"
        >
          {DIMENSIONS.map(({ key, labelKey, invert }) => {
            const level = levelFromValue(symptom[key], invert);
            return (
              <div key={key} className="contents">
                <dt className="text-muted-foreground">{t(labelKey)}</dt>
                <dd
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold text-foreground",
                    DAY_LEVEL_SURFACE[level],
                  )}
                >
                  {t(LEVEL_SHORT_KEY[level])}
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      <p className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
        <span
          className={cn(
            "inline-flex size-2 shrink-0 rounded-full",
            symptom.routinesOk ? "bg-status-success" : "bg-status-warning",
          )}
          aria-hidden="true"
        />
        {symptom.routinesOk
          ? t("symptoms.routinesKept")
          : t("symptoms.routinesComplicated")}
      </p>
      {symptom.notes && (
        <p
          className={cn(
            "text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]",
            !expanded && "line-clamp-3",
          )}
        >
          {symptom.notes}
        </p>
      )}
    </EntryCard>
  );
}
