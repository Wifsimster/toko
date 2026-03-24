import { useState } from "react";
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
  { key: "social", label: "Comportement social" },
  { key: "autonomy", label: "Autonomie" },
] as const;

type DimensionKey = (typeof dimensions)[number]["key"];

export function SymptomForm({
  initialData,
  onSuccess,
}: {
  initialData?: Symptom | null;
  onSuccess: () => void;
}) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const isEdit = !!initialData;

  const [values, setValues] = useState<Record<DimensionKey, number>>({
    agitation: initialData?.agitation ?? 5,
    focus: initialData?.focus ?? 5,
    impulse: initialData?.impulse ?? 5,
    mood: initialData?.mood ?? 5,
    sleep: initialData?.sleep ?? 5,
    social: initialData?.social ?? 5,
    autonomy: initialData?.autonomy ?? 5,
  });
  const [context, setContext] = useState(initialData?.context ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const isPending = createSymptom.isPending || updateSymptom.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    if (isEdit && initialData) {
      updateSymptom.mutate(
        {
          id: initialData.id,
          childId: activeChildId,
          ...values,
          context: context || undefined,
          notes: notes || undefined,
        },
        { onSuccess }
      );
    } else {
      createSymptom.mutate(
        {
          childId: activeChildId,
          date: new Date().toISOString().split("T")[0]!,
          ...values,
          context: context || undefined,
          notes: notes || undefined,
        },
        { onSuccess }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {dimensions.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={key}>{label}</Label>
            <span className="text-sm font-medium text-muted-foreground">
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
            ? "Mettre à jour"
            : "Enregistrer"}
      </Button>
    </form>
  );
}
