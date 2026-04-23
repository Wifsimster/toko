import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSymptom, useUpdateSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import type { Symptom } from "@focusflow/validators";

const dimensions = [
  { key: "agitation", labelKey: "dimensions.agitation" },
  { key: "focus", labelKey: "dimensions.focus" },
  { key: "impulse", labelKey: "dimensions.impulse" },
  { key: "mood", labelKey: "dimensions.mood" },
  { key: "sleep", labelKey: "dimensions.sleep" },
] as const;

type DimensionKey = (typeof dimensions)[number]["key"];
type Values = Record<DimensionKey, number> & { routinesOk: boolean };

const NEUTRAL: Values = {
  agitation: 5,
  focus: 5,
  impulse: 5,
  mood: 5,
  sleep: 5,
  routinesOk: true,
};

const PRESET_CALM: Values = {
  agitation: 3,
  focus: 7,
  impulse: 3,
  mood: 8,
  sleep: 7,
  routinesOk: true,
};

const PRESET_TOUGH: Values = {
  agitation: 8,
  focus: 3,
  impulse: 8,
  mood: 3,
  sleep: 4,
  routinesOk: false,
};

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0]!;
}

function extractValues(s: Symptom | null | undefined): Values {
  if (!s) return NEUTRAL;
  return {
    agitation: s.agitation,
    focus: s.focus,
    impulse: s.impulse,
    mood: s.mood,
    sleep: s.sleep,
    routinesOk: s.routinesOk,
  };
}

export function SymptomForm({
  initialData,
  existingEntries = [],
  onSuccess,
}: {
  initialData?: Symptom | null;
  existingEntries?: Symptom[];
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const latestEntry = useMemo(() => {
    if (existingEntries.length === 0) return null;
    return [...existingEntries].sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0]!;
  }, [existingEntries]);

  const [date, setDate] = useState(initialData?.date ?? todayISO());

  const matchingEntry = useMemo(() => {
    if (initialData) return initialData;
    return existingEntries.find((e) => e.date === date) ?? null;
  }, [initialData, existingEntries, date]);

  const isEdit = !!matchingEntry;
  const usingSmartDefaults = !isEdit && !!latestEntry && !initialData;

  const [values, setValues] = useState<Values>(
    extractValues(matchingEntry ?? latestEntry)
  );
  const [context, setContext] = useState(
    matchingEntry?.context ?? ""
  );
  const [notes, setNotes] = useState(matchingEntry?.notes ?? "");

  useEffect(() => {
    if (initialData) return;
    if (matchingEntry) {
      setValues(extractValues(matchingEntry));
      setContext(matchingEntry.context ?? "");
      setNotes(matchingEntry.notes ?? "");
    }
  }, [initialData, matchingEntry]);

  const isPending = createSymptom.isPending || updateSymptom.isPending;

  const applyPreset = (v: Values) => setValues(v);

  const setToday = () => setDate(todayISO());
  const setYesterday = () => setDate(yesterdayISO());
  const isToday = date === todayISO();
  const isYesterday = date === yesterdayISO();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    const payload = {
      ...values,
      context: context || undefined,
      notes: notes || undefined,
    };

    if (isEdit && matchingEntry) {
      updateSymptom.mutate(
        {
          id: matchingEntry.id,
          childId: activeChildId,
          ...payload,
        },
        { onSuccess }
      );
    } else {
      createSymptom.mutate(
        {
          childId: activeChildId,
          date,
          ...payload,
        },
        { onSuccess }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symptom-date">{t("journal.formDate")}</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="symptom-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-auto"
          />
          <Button
            type="button"
            variant={isToday ? "default" : "outline"}
            size="sm"
            onClick={setToday}
          >
            {t("journal.today")}
          </Button>
          <Button
            type="button"
            variant={isYesterday ? "default" : "outline"}
            size="sm"
            onClick={setYesterday}
          >
            {t("journal.yesterday")}
          </Button>
        </div>
      </div>

      {isEdit && !initialData && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2 text-xs text-foreground"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-status-warning"
            aria-hidden="true"
          />
          <span>{t("symptoms.conflictBanner")}</span>
        </div>
      )}

      {usingSmartDefaults && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{t("symptoms.smartDefaults")}</span>
          <button
            type="button"
            onClick={() => setValues(NEUTRAL)}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {t("symptoms.reset")}
          </button>
        </div>
      )}

      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("symptoms.shortcuts")}
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(PRESET_CALM)}
            >
              {t("symptoms.presetCalm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(PRESET_TOUGH)}
            >
              {t("symptoms.presetTough")}
            </Button>
            {latestEntry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(extractValues(latestEntry))}
              >
                {t("symptoms.presetTypical")}
              </Button>
            )}
          </div>
        </div>
      )}

      {dimensions.map(({ key, labelKey }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={key}>{t(labelKey)}</Label>
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {values[key]}/10
            </span>
          </div>
          <Slider
            id={key}
            min={0}
            max={10}
            step={1}
            value={[values[key]]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              setValues((prev) => ({ ...prev, [key]: v }));
            }}
          />
        </div>
      ))}

      <label
        htmlFor="routines-ok"
        className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2.5 text-sm"
      >
        <span>{t("symptoms.routinesLabel")}</span>
        <input
          id="routines-ok"
          type="checkbox"
          checked={values.routinesOk}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, routinesOk: e.target.checked }))
          }
          className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
        />
      </label>

      <div className="space-y-2">
        <Label htmlFor="context">{t("symptoms.context")}</Label>
        <Input
          id="context"
          placeholder={t("symptoms.contextPlaceholder")}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("symptoms.notes")}</Label>
        <Textarea
          id="notes"
          placeholder={t("symptoms.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || isPending}
      >
        {isPending
          ? t("symptoms.saving")
          : isEdit
            ? t("symptoms.update")
            : t("symptoms.create")}
      </Button>
    </form>
  );
}
