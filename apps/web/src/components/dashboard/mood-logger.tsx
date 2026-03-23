import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const moods = [
  { emoji: "😢", label: "Difficile", value: 1 },
  { emoji: "😐", label: "Moyen", value: 2 },
  { emoji: "🙂", label: "Bien", value: 3 },
  { emoji: "😄", label: "Super", value: 4 },
] as const;

export function MoodLogger() {
  const [selected, setSelected] = useState<number | null>(null);

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
              onClick={() => setSelected(mood.value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all hover:bg-accent sm:px-4 sm:py-3 ${
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
