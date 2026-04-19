import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, BookOpen, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  JournalCard,
  tagConfig,
} from "@/components/journal/journal-card";
import { JournalForm } from "@/components/journal/journal-form";
import { useJournal, useDeleteJournalEntry } from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";
import type { JournalEntry, JournalTag } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/journal/")({
  component: JournalPage,
  staticData: { crumb: "nav.journal" },
});

function JournalPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: entries, isLoading } = useJournal(activeChildId ?? "");
  const deleteEntry = useDeleteJournalEntry();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);

  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState<JournalTag[]>([]);

  const openCreate = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };
  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingEntry(null);
  };

  const toggleTagFilter = (tag: JournalTag) => {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setFilterTags([]);
  };

  const hasActiveFilters = search !== "" || filterTags.length > 0;

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    const sorted = [...entries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    if (!hasActiveFilters) return sorted;

    const q = search.trim().toLowerCase();
    return sorted.filter((e) => {
      if (q && !e.text.toLowerCase().includes(q)) return false;
      if (
        filterTags.length > 0 &&
        !filterTags.some((t) => (e.tags as JournalTag[]).includes(t))
      )
        return false;
      return true;
    });
  }, [entries, search, filterTags, hasActiveFilters]);

  const handleDelete = () => {
    if (!deletingEntry || !activeChildId) return;
    deleteEntry.mutate(
      { id: deletingEntry.id, childId: activeChildId },
      {
        onSuccess: () => {
          toast.success(t("journal.entryDeleted"));
          setDeletingEntry(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("journal.title")}
        description={t("journal.subtitle")}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("journal.writeButton")}
          </Button>
        }
      />

      {/* Filter bar */}
      {entries && entries.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("journal.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.entries(tagConfig) as [
              JournalTag,
              (typeof tagConfig)[JournalTag],
            ][]).map(([tag, config]) => {
              const active = filterTags.includes(tag);
              return (
                <Button
                  key={tag}
                  type="button"
                  size="xs"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => toggleTagFilter(tag)}
                >
                  {t(config.labelKey)}
                </Button>
              );
            })}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                {t("journal.clearFilters")}
              </Button>
            )}
          </div>
        </div>
      )}

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("journal.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !entries?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("journal.emptyState")}</p>
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("journal.noMatch")}</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t("journal.clearFiltersButton")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onEdit={openEdit}
              onDelete={setDeletingEntry}
            />
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => !open && closeForm()}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {editingEntry ? t("journal.editEntry") : t("journal.newEntry")}
            </DialogTitle>
          </DialogHeader>
          <JournalForm
            key={editingEntry?.id ?? "create"}
            initialData={editingEntry}
            onSuccess={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("journal.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("journal.deleteBodyPrefix")}{" "}
            <strong className="text-foreground">
              {deletingEntry &&
                new Date(deletingEntry.date).toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
            </strong>{" "}
            {t("journal.deleteBodySuffix")}
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("child.cancel")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? t("journal.deleting") : t("journal.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
