import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateJournalEntry,
  useUpdateJournalEntry,
} from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";
import { tagConfig } from "@/components/journal/journal-card";
import type { JournalTag, JournalEntry } from "@focusflow/validators";

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function JournalForm({
  initialData,
  onSuccess,
}: {
  initialData?: JournalEntry | null;
  onSuccess: () => void;
}) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();

  const isEdit = !!initialData;
  const [text, setText] = useState(initialData?.text ?? "");
  const [selectedTags, setSelectedTags] = useState<JournalTag[]>(
    (initialData?.tags as JournalTag[]) ?? []
  );
  const [date, setDate] = useState(initialData?.date ?? todayISO());

  const isPending = createEntry.isPending || updateEntry.isPending;

  const toggleTag = (tag: JournalTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    const payload = {
      date,
      text,
      tags: selectedTags,
    };

    if (isEdit && initialData) {
      updateEntry.mutate(
        { id: initialData.id, childId: activeChildId, ...payload },
        { onSuccess }
      );
    } else {
      createEntry.mutate(
        { childId: activeChildId, ...payload },
        { onSuccess }
      );
    }
  };

  const setToday = () => setDate(todayISO());
  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split("T")[0]!);
  };

  const isToday = date === todayISO();
  const yesterdayISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0]!;
  })();
  const isYesterday = date === yesterdayISO;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date picker with quick shortcuts */}
      <div className="space-y-2">
        <Label htmlFor="journal-date">Date</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="journal-date"
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
        <Label htmlFor="journal-text">
          Notes <span className="text-muted-foreground">(facultatif)</span>
        </Label>
        <Textarea
          id="journal-text"
          placeholder="Une victoire, une difficulté, une stratégie qui a aidé…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
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
            ? "Enregistrer"
            : "Ajouter l'entrée"}
      </Button>
    </form>
  );
}
