import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSymptom, useUpdateSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import { toISODate, todayISO } from "@/lib/date";
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

const EMPTY_ENTRIES: Symptom[] = [];

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toISODate(d);
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

type FormState = Values & { context: string; notes: string };

// Slider values follow the smart-default source (the matching entry, or the
// latest one for a fresh day), but the free-text context/notes are only
// pre-filled from an exact same-date entry — they are day-specific and must
// not inherit a previous day's observations.
function buildFormState(
  valuesSource: Symptom | null,
  fieldsSource: Symptom | null
): FormState {
  const v = extractValues(valuesSource);
  return {
    ...v,
    context: fieldsSource?.context ?? "",
    notes: fieldsSource?.notes ?? "",
  };
}

export function SymptomForm({
  initialData,
  existingEntries = EMPTY_ENTRIES,
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
    return existingEntries.toSorted((a, b) =>
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

  // Single form state object — keyed by matchingEntry so it resets
  // automatically when the date changes to a different (or no) existing entry.
  const matchingEntryId = matchingEntry?.id ?? null;
  const [formState, setFormState] = useState<FormState>(() =>
    buildFormState(matchingEntry ?? latestEntry, matchingEntry)
  );
  // When the user picks a date that has an existing entry, refill the form
  // from it. Switching to a date with no entry keeps the current values
  // (the smart defaults), matching the original behavior. The previous id is
  // tracked in a ref (it never drives rendered output, only the reset guard).
  const lastSyncedIdRef = useRef(matchingEntryId);
  if (lastSyncedIdRef.current !== matchingEntryId && !initialData) {
    if (matchingEntry) {
      setFormState(buildFormState(matchingEntry, matchingEntry));
    }
    lastSyncedIdRef.current = matchingEntryId;
  }

  const values: Values = {
    agitation: formState.agitation,
    focus: formState.focus,
    impulse: formState.impulse,
    mood: formState.mood,
    sleep: formState.sleep,
    routinesOk: formState.routinesOk,
  };
  const context = formState.context;
  const notes = formState.notes;

  const setValues = (updater: Values | ((prev: Values) => Values)) => {
    setFormState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...prev, ...next };
    });
  };
  const setContext = (v: string) => setFormState((prev) => ({ ...prev, context: v }));
  const setNotes = (v: string) => setFormState((prev) => ({ ...prev, notes: v }));

  const isPending = createSymptom.isPending || updateSymptom.isPending;

  const applyPreset = (v: Values) => setValues(v);

  const handleSetToday = () => setDate(todayISO());
  const handleSetYesterday = () => setDate(yesterdayISO());
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
            onClick={handleSetToday}
          >
            {t("journal.today")}
          </Button>
          <Button
            type="button"
            variant={isYesterday ? "default" : "outline"}
            size="sm"
            onClick={handleSetYesterday}
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
            className="mt-0.5 size-4 shrink-0 text-status-warning"
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
        <div
          className={
            // Sticky on mobile so presets stay reachable while the parent
            // scrolls through the sliders mid-crisis. Static on desktop.
            "sticky top-0 z-10 -mx-4 space-y-1.5 border-b border-border/40 " +
            "bg-background/95 px-4 py-2 backdrop-blur " +
            "md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
          }
        >
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
              <span aria-hidden="true">😌</span>
              {t("symptoms.presetCalm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(PRESET_TOUGH)}
            >
              <span aria-hidden="true">😤</span>
              {t("symptoms.presetTough")}
            </Button>
            {latestEntry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(extractValues(latestEntry))}
              >
                <span aria-hidden="true">🔁</span>
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
        <Checkbox
          id="routines-ok"
          className="size-5"
          checked={values.routinesOk}
          onCheckedChange={(checked) =>
            setValues((prev) => ({ ...prev, routinesOk: checked === true }))
          }
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
