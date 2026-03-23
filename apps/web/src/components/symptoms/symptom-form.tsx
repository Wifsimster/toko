import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";

const dimensions = [
  { key: "agitation", label: "Agitation" },
  { key: "focus", label: "Concentration" },
  { key: "impulse", label: "Impulsivité" },
  { key: "mood", label: "Régulation émotionnelle" },
  { key: "sleep", label: "Sommeil" },
  { key: "social", label: "Comportement social" },
  { key: "autonomy", label: "Autonomie" },
] as const;

export function SymptomForm({ onSuccess }: { onSuccess: () => void }) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createSymptom = useCreateSymptom();

  const [values, setValues] = useState({
    agitation: 5,
    focus: 5,
    impulse: 5,
    mood: 5,
    sleep: 5,
    social: 5,
    autonomy: 5,
  });
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

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
        disabled={!activeChildId || createSymptom.isPending}
      >
        {createSymptom.isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
