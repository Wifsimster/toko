import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSymptom, useUpdateSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import type { Symptom } from "@focusflow/validators";

const dimensions = [
  { key: "agitation", label: "Agitation" },
  { key: "focus", label: "Concentration" },
  { key: "impulse", label: "Impulsivité" },
  { key: "mood", label: "Régulation émotionnelle" },
  { key: "sleep", label: "Sommeil" },
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

// Presets: high agitation/impulse = "bad", high focus/mood/sleep = "good"
const PRESETS: Record<"calm" | "tough", { label: string; values: Values }> = {
  calm: {
    label: "Journée calme",
    values: {
      agitation: 3,
      focus: 7,
      impulse: 3,
      mood: 8,
      sleep: 7,
      routinesOk: true,
    },
  },
  tough: {
    label: "Journée difficile",
    values: {
      agitation: 8,
      focus: 3,
      impulse: 8,
      mood: 3,
      sleep: 4,
      routinesOk: false,
    },
  },
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
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  // Most recent entry (for smart defaults)
  const latestEntry = useMemo(() => {
    if (existingEntries.length === 0) return null;
    return [...existingEntries].sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0]!;
  }, [existingEntries]);

  const [date, setDate] = useState(initialData?.date ?? todayISO());

  // Derive the effective record to edit: either the explicit initialData,
  // or an existing entry matching the picked date
  const matchingEntry = useMemo(() => {
    if (initialData) return initialData;
    return existingEntries.find((e) => e.date === date) ?? null;
  }, [initialData, existingEntries, date]);

  const isEdit = !!matchingEntry;
  const usingSmartDefaults = !isEdit && !!latestEntry && !initialData;

  // Initial slider values: matching entry > last entry > neutral
  const [values, setValues] = useState<Values>(
    extractValues(matchingEntry ?? latestEntry)
  );
  const [context, setContext] = useState(
    matchingEntry?.context ?? ""
  );
  const [notes, setNotes] = useState(matchingEntry?.notes ?? "");

  // When date changes and matches an existing entry, swap form into its values
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
      {/* Date picker with quick shortcuts */}
      <div className="space-y-2">
        <Label htmlFor="symptom-date">Date</Label>
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
            Aujourd'hui
          </Button>
          <Button
            type="button"
            variant={isYesterday ? "default" : "outline"}
            size="sm"
            onClick={setYesterday}
          >
            Hier
          </Button>
        </div>
      </div>

      {/* Same-day conflict banner */}
      {isEdit && !initialData && (
        <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2 text-xs text-foreground">
          Un relevé existe déjà pour cette date. Vos modifications le
          remplaceront.
        </div>
      )}

      {/* Smart defaults hint */}
      {usingSmartDefaults && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>Valeurs pré-remplies à partir du dernier relevé.</span>
          <button
            type="button"
            onClick={() => setValues(NEUTRAL)}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Presets */}
      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Raccourcis
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(PRESETS.calm.values)}
            >
              {PRESETS.calm.label}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(PRESETS.tough.values)}
            >
              {PRESETS.tough.label}
            </Button>
            {latestEntry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(extractValues(latestEntry))}
              >
                Journée typique
              </Button>
            )}
          </div>
        </div>
      )}

      {dimensions.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={key}>{label}</Label>
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

      {/* Routines OK — single functional question */}
      <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
        <Label htmlFor="routines-ok" className="cursor-pointer text-sm">
          Les routines du jour ont été tenues
        </Label>
        <input
          id="routines-ok"
          type="checkbox"
          checked={values.routinesOk}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, routinesOk: e.target.checked }))
          }
          className="h-4 w-4 cursor-pointer accent-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="context">Contexte</Label>
        <Input
          id="context"
          placeholder="Ex: journée d'école, week-end..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Observations libres..."
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
          ? "Enregistrement..."
          : isEdit
            ? "Mettre à jour le relevé"
            : "Enregistrer le relevé"}
      </Button>
    </form>
  );
}
