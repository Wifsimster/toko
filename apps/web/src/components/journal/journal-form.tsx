import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "lucide-react";
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
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
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

  const formattedDate = new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Journal page heading: date as a styled title */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <p className="font-heading text-xl font-medium capitalize tracking-tight text-foreground sm:text-2xl">
          {formattedDate}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isToday ? "default" : "outline"}
            size="sm"
            onClick={setToday}
          >
            {t("journal.today")}
          </Button>
          <Button
            type="button"
            variant={isYesterday ? "default" : "outline"}
            size="sm"
            onClick={setYesterday}
          >
            {t("journal.yesterday")}
          </Button>
          <div className="relative ml-auto">
            <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="journal-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              required
              aria-label={t("journal.formDate")}
              className="h-9 w-auto pl-8"
            />
          </div>
        </div>
      </div>

      {/* Hero writing area */}
      <div>
        <Label htmlFor="journal-text" className="sr-only">
          {t("journal.notes")}
        </Label>
        <Textarea
          id="journal-text"
          placeholder={t("journal.notesPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          autoFocus={!isEdit}
          className="min-h-[240px] resize-none border-0 bg-transparent px-0 py-0 font-heading text-base leading-relaxed tracking-[0.005em] shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-lg"
        />
      </div>

      {/* Tags as discreet footer */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("journal.tags")}
        </Label>
        <div className="flex flex-wrap gap-1.5">
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
              {t(config.labelKey)}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || isPending}
      >
        {isPending
          ? t("journal.saving")
          : isEdit
            ? t("journal.save")
            : t("journal.addEntry")}
      </Button>
    </form>
  );
}
