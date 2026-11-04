import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, History } from "lucide-react";
import { toast } from "sonner";
import {
  SYMPTOM_PRESET_CALM,
  SYMPTOM_PRESET_TOUGH,
  dayLevelOf,
  symptomValuesOf,
  type DayLevel,
  type Symptom,
  type SymptomValues,
} from "@focusflow/validators";
import { Mo } from "@/components/mo/mo";
import { Button } from "@/components/ui/button";
import { useCreateSymptom } from "@/hooks/use-symptoms";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DAY_LEVEL_SURFACE } from "./day-level";
import { symptomWeek } from "./symptom-week";

type Choice = "calm" | "typical" | "tough";

const CHOICE_LEVEL: Record<Choice, DayLevel> = { calm: "good", typical: "ok", tough: "hard" };
const LEVEL_LABEL: Record<DayLevel, string> = {
  good: "symptoms.today.levelGood",
  ok: "symptoms.today.levelOk",
  hard: "symptoms.today.levelHard",
};
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function SymptomTodayPanel({
  childId,
  entries,
  onRefine,
  onEdit,
}: {
  childId: string;
  entries: Symptom[];
  onRefine: (values: SymptomValues) => void;
  onEdit: (entry: Symptom) => void;
}) {
  const { t } = useTranslation();
  const today = todayISO();
  const createSymptom = useCreateSymptom();
  const [choice, setChoice] = useState<Choice | null>(null);

  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const latest = useMemo(
    () => entries.toSorted((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [entries],
  );
  const week = useMemo(() => symptomWeek(entries, today), [entries, today]);

  const valuesFor = (c: Choice): SymptomValues =>
    c === "calm" ? SYMPTOM_PRESET_CALM : c === "tough" ? SYMPTOM_PRESET_TOUGH : symptomValuesOf(latest);

  const save = () => {
    if (!choice || createSymptom.isPending) return;
    createSymptom.mutate(
      { childId, date: today, ...valuesFor(choice) },
      {
        onSuccess: () => {
          toast.success(t("symptoms.today.saved"));
          setChoice(null);
        },
      },
    );
  };

  const tiles: { key: Choice; label: string; art: React.ReactNode }[] = [
    { key: "calm", label: t("symptoms.presetCalm"), art: <Mo state="calme" size={44} shadow={false} /> },
    {
      key: "typical",
      label: t("symptoms.presetTypical"),
      art: <History className="size-5 text-foreground" aria-hidden="true" />,
    },
    { key: "tough", label: t("symptoms.presetTough"), art: <Mo state="trop-plein" size={44} shadow={false} /> },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-labelledby="symptom-today-title" className="rounded-[28px] border border-border bg-card p-5">
        <h2 id="symptom-today-title" className="text-[1.0625rem] font-extrabold">
          {t("symptoms.today.title")}
        </h2>
        {todayEntry ? (
          <div className="mt-3 space-y-3">
            <div
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-[20px] px-4 py-3",
                DAY_LEVEL_SURFACE[dayLevelOf(todayEntry)],
              )}
            >
              <Check className="size-5 shrink-0 text-brand-strong" aria-hidden="true" />
              <div>
                <p className="font-semibold">{t("symptoms.today.done")}</p>
                <p className="text-sm text-muted-foreground">{t(LEVEL_LABEL[dayLevelOf(todayEntry)])}</p>
              </div>
            </div>
            <Button variant="outline" className="min-h-11 rounded-full md:h-11" onClick={() => onEdit(todayEntry)}>
              {t("symptoms.today.edit")}
            </Button>
          </div>
        ) : (
          <>
            <div role="radiogroup" aria-labelledby="symptom-today-title" className="mt-3 grid gap-2.5">
              {tiles.map((tile) => {
                const selected = choice === tile.key;
                return (
                  <button
                    key={tile.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setChoice(tile.key)}
                    className={cn(
                      "flex min-h-16 items-center gap-3 rounded-[20px] border-2 px-3 py-2 text-left transition-colors",
                      DAY_LEVEL_SURFACE[CHOICE_LEVEL[tile.key]],
                      selected ? "border-foreground" : "border-transparent",
                    )}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card">
                      {tile.art}
                    </span>
                    <span className="flex-1 text-[1.0625rem] font-bold">{tile.label}</span>
                    {selected && <Check className="size-5 text-brand-strong" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => onRefine(choice ? valuesFor(choice) : symptomValuesOf(latest))}
              className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-[16px] border border-border px-4 text-left hover:bg-muted"
            >
              <span>
                <span className="block text-sm font-semibold">{t("symptoms.today.refine")}</span>
                <span className="block text-xs text-muted-foreground">{t("symptoms.today.refineHint")}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
            <Button
              size="lg"
              className="mt-4 min-h-12 w-full rounded-full md:h-12"
              disabled={!choice || createSymptom.isPending}
              onClick={save}
            >
              {t("symptoms.today.save")}
            </Button>
          </>
        )}
      </section>

      <section aria-labelledby="symptom-week-title" className="rounded-[28px] border border-border bg-card p-5">
        <h2 id="symptom-week-title" className="text-[0.9375rem] font-semibold">
          {t("symptoms.today.weekTitle")}
        </h2>
        <ol className="mt-3 flex justify-between">
          {week.map((day, i) => {
            const key = DAY_KEYS[i] ?? "mon";
            return (
              <li
                key={day.date}
                className="flex w-9 flex-col items-center gap-1.5"
                aria-label={t(day.level ? "symptoms.today.dayLogged" : "symptoms.today.dayEmpty", {
                  day: t(`symptoms.today.days.${key}`),
                  level: day.level ? t(LEVEL_LABEL[day.level]) : "",
                })}
              >
                <span aria-hidden="true" className="text-xs font-semibold text-muted-foreground">
                  {t(`symptoms.today.daysShort.${key}`)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "block size-8 rounded-[10px]",
                    day.level ? DAY_LEVEL_SURFACE[day.level] : "border-[1.5px] border-dashed border-border bg-card",
                    day.level === "ok" && "ring-1 ring-border ring-inset",
                  )}
                />
              </li>
            );
          })}
        </ol>
        <div aria-hidden="true" className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {(["good", "ok", "hard"] as const).map((level) => (
            <span key={level} className="flex items-center gap-1.5">
              <span className={cn("block size-3 rounded", DAY_LEVEL_SURFACE[level], level === "ok" && "ring-1 ring-border ring-inset")} />
              {t(LEVEL_LABEL[level])}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
