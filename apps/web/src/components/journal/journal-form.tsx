import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateJournalEntry } from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";
import { tagConfig, moodEmojis } from "@/components/journal/journal-card";
import type { JournalTag } from "@focusflow/validators";

export function JournalForm({ onSuccess }: { onSuccess: () => void }) {
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
