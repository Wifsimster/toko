import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export function JournalCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entry: JournalEntry) => void;
}) {
  const hasActions = !!(onEdit || onDelete);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium capitalize">
            {new Date(entry.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-lg" aria-label={`Humeur ${entry.moodRating}/4`}>
              {moodEmojis[entry.moodRating - 1]}
            </span>
            {hasActions && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Actions sur l'entrée"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
                <PopoverContent align="end" className="w-40 gap-0 p-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {entry.text && (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {entry.text}
          </p>
        )}
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
