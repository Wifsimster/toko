import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JournalTag, JournalEntry } from "@focusflow/validators";

const tagConfig: Record<
  JournalTag,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  school: { label: "École", variant: "default" },
  victory: { label: "Victoire", variant: "default" },
  crisis: { label: "Crise", variant: "destructive" },
  medication: { label: "Traitement", variant: "secondary" },
  sleep: { label: "Sommeil", variant: "secondary" },
  sport: { label: "Sport", variant: "outline" },
  therapy: { label: "Thérapie", variant: "outline" },
};

const moodEmojis = ["😢", "😐", "🙂", "😄"];

export { tagConfig, moodEmojis };

export function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {new Date(entry.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
          <span className="text-lg">{moodEmojis[entry.moodRating - 1]}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground">{entry.text}</p>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tagConfig[tag as JournalTag]?.variant ?? "secondary"}
                className="text-xs"
              >
                {tagConfig[tag as JournalTag]?.label ?? tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
