import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NotebookPen, Check, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJournalEntry } from "@/hooks/use-journal";
import { tagConfig } from "@/components/journal/journal-card-data";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Mo } from "@/components/mo/mo";
import type { JournalTag } from "@focusflow/validators";

const QUICK_TAGS: JournalTag[] = ["victory", "crisis", "school", "sleep"];

export function JournalQuickNote({
  childId,
  childName,
  variant = "dashboard",
}: {
  childId: string;
  childName?: string;
  variant?: "dashboard" | "journal";
}) {
  const { t } = useTranslation();
  const createEntry = useCreateJournalEntry();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const toggleTag = (tag: JournalTag) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );

  const handleSave = () => {
    if (!text.trim() || createEntry.isPending) return;
    createEntry.mutate(
      { childId, date: todayISO(), text: text.trim(), tags },
      {
        onSuccess: () => {
          setText("");
          setTags([]);
          setJustSaved(true);
          toast.success(t("journalQuickNote.saved"));
          setTimeout(() => setJustSaved(false), 2500);
        },
      }
    );
  };

  const tagChips = (
    <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-3 py-1 text-xs font-medium md:min-h-0 transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {t(tagConfig[tag].labelKey)}
              </button>
            );
          })}
        </div>
  );

  if (variant === "journal") {
    const title = childName
      ? t("journalQuickNote.journalTitleWithName", { name: childName })
      : t("journalQuickNote.journalTitle");
    return (
      <section aria-labelledby="journal-composer-title" className="relative rounded-[28px] bg-surface-mint p-5">
        <Mo state="theme-emotions" size={64} className="absolute top-2 right-3" />
        <h2 id="journal-composer-title" className="pr-16 text-[1.0625rem] font-extrabold">
          {title}
        </h2>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("journalQuickNote.journalPlaceholder")}
          rows={3}
          aria-label={title}
          className="mt-3 resize-none border-secondary bg-card"
        />
        <div className="mt-3">{tagChips}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p aria-hidden="true" className="font-hand text-[19px] leading-none font-semibold text-brand-strong">
            {t("journalQuickNote.note")}
          </p>
          <Button
            onClick={handleSave}
            disabled={!text.trim() || createEntry.isPending}
            size="lg"
            className="min-h-11 gap-2 rounded-full px-5 md:h-11"
          >
            {justSaved ? <Check className="size-4" data-icon="inline-start" /> : null}
            {justSaved ? t("journalQuickNote.savedShort") : t("journalQuickNote.save")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookPen className="size-4" />
          {t("journalQuickNote.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("journalQuickNote.placeholder")}
          rows={3}
          aria-label={t("journalQuickNote.title")}
          className="resize-none"
        />
        {tagChips}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={handleSave}
            disabled={!text.trim() || createEntry.isPending}
            className="gap-2"
          >
            {justSaved ? (
              <Check className="size-4" data-icon="inline-start" />
            ) : null}
            {justSaved
              ? t("journalQuickNote.savedShort")
              : t("journalQuickNote.save")}
          </Button>
          <Link
            to="/journal"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("journalQuickNote.openJournal")}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
