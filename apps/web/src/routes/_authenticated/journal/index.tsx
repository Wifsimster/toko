import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { useJournal, useCreateJournalEntry } from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";
import type { JournalTag, JournalEntry } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/journal/")({
  component: JournalPage,
});

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

function JournalPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: entries, isLoading } = useJournal(activeChildId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Journal</h1>
          <p className="text-muted-foreground">
            Notes et observations quotidiennes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Écrire
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle entrée</DialogTitle>
            </DialogHeader>
            <JournalForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir son journal.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !entries?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Votre journal est vide. Commencez à écrire vos premières
              observations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
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

function JournalForm({ onSuccess }: { onSuccess: () => void }) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createEntry = useCreateJournalEntry();
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<JournalTag[]>([]);
  const [moodRating, setMoodRating] = useState(3);

  const toggleTag = (tag: JournalTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    createEntry.mutate(
      {
        childId: activeChildId,
        date: new Date().toISOString().split("T")[0]!,
        text,
        tags: selectedTags,
        moodRating,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Humeur du jour</Label>
        <div className="flex justify-around">
          {moodEmojis.map((emoji, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMoodRating(i + 1)}
              className={`rounded-xl px-4 py-2 text-2xl transition-all ${
                moodRating === i + 1
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(tagConfig) as [
              JournalTag,
              (typeof tagConfig)[JournalTag],
            ][]
          ).map(([tag, config]) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {config.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-text">Notes</Label>
        <Textarea
          id="journal-text"
          placeholder="Comment s'est passée la journée ?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || createEntry.isPending}
      >
        {createEntry.isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
