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
import type { JournalTag } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/journal/")({
  component: JournalPage,
});

const tagConfig: Record<JournalTag, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
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

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Votre journal est vide. Commencez à écrire vos premières
            observations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function JournalForm({ onSuccess }: { onSuccess: () => void }) {
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<JournalTag[]>([]);
  const [moodRating, setMoodRating] = useState(3);

  const toggleTag = (tag: JournalTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess();
      }}
      className="space-y-4"
    >
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
          {(Object.entries(tagConfig) as [JournalTag, typeof tagConfig[JournalTag]][]).map(
            ([tag, config]) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {config.label}
              </Badge>
            )
          )}
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

      <Button type="submit" className="w-full">
        Enregistrer
      </Button>
    </form>
  );
}
