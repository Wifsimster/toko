import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateJournalEntry } from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";

const moods = [
  { emoji: "😢", label: "Difficile", value: 1 },
  { emoji: "😐", label: "Moyen", value: 2 },
  { emoji: "🙂", label: "Bien", value: 3 },
  { emoji: "😄", label: "Super", value: 4 },
] as const;

export function MoodLogger() {
  const [selected, setSelected] = useState<number | null>(null);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createEntry = useCreateJournalEntry();

  const handleSelect = (value: number) => {
    if (!activeChildId) return;
    setSelected(value);
    const today = new Date().toISOString().split("T")[0]!;
    const label = moods.find((m) => m.value === value)?.label ?? "";
    createEntry.mutate(
      {
        childId: activeChildId,
        date: today,
        text: `Humeur du jour : ${label}`,
        moodRating: value,
        tags: [],
      },
      {
        onSuccess: () => toast.success("Humeur enregistrée"),
      }
    );
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
              disabled={createEntry.isPending || !activeChildId}
              onClick={() => handleSelect(mood.value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all hover:bg-accent sm:px-4 sm:py-3 disabled:opacity-50 ${
                selected === mood.value
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
