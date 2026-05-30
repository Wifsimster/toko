import { useMemo, useReducer } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, BookOpen, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  staticData: {
    crumb: "nav.journal",
  },
});

type JournalUiState = {
  formOpen: boolean;
  editingEntry: JournalEntry | null;
  deletingEntry: JournalEntry | null;
  search: string;
  filterTags: JournalTag[];
};

type JournalUiAction =
  | { type: "OPEN_CREATE" }
  | { type: "OPEN_EDIT"; entry: JournalEntry }
  | { type: "CLOSE_FORM" }
  | { type: "SET_DELETING"; entry: JournalEntry | null }
  | { type: "SET_SEARCH"; search: string }
  | { type: "TOGGLE_TAG"; tag: JournalTag }
  | { type: "CLEAR_FILTERS" };

const initialJournalUiState: JournalUiState = {
  formOpen: false,
  editingEntry: null,
  deletingEntry: null,
  search: "",
  filterTags: [],
};

function journalUiReducer(state: JournalUiState, action: JournalUiAction): JournalUiState {
  switch (action.type) {
    case "OPEN_CREATE":
      return { ...state, formOpen: true, editingEntry: null };
    case "OPEN_EDIT":
      return { ...state, formOpen: true, editingEntry: action.entry };
    case "CLOSE_FORM":
      return { ...state, formOpen: false, editingEntry: null };
    case "SET_DELETING":
      return { ...state, deletingEntry: action.entry };
    case "SET_SEARCH":
      return { ...state, search: action.search };
    case "TOGGLE_TAG":
      return {
        ...state,
        filterTags: state.filterTags.includes(action.tag)
          ? state.filterTags.filter((t) => t !== action.tag)
          : [...state.filterTags, action.tag],
      };
    case "CLEAR_FILTERS":
      return { ...state, search: "", filterTags: [] };
  }
}

export function JournalPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: entries, isLoading } = useJournal(activeChildId ?? "");
  const deleteEntry = useDeleteJournalEntry();

  const [ui, dispatch] = useReducer(journalUiReducer, initialJournalUiState);
  const { formOpen, editingEntry, deletingEntry, search, filterTags } = ui;

  const openCreate = () => dispatch({ type: "OPEN_CREATE" });
  const openEdit = (entry: JournalEntry) => dispatch({ type: "OPEN_EDIT", entry });
  const closeForm = () => dispatch({ type: "CLOSE_FORM" });

  const toggleTagFilter = (tag: JournalTag) => dispatch({ type: "TOGGLE_TAG", tag });
  const clearFilters = () => dispatch({ type: "CLEAR_FILTERS" });

  const hasActiveFilters = search !== "" || filterTags.length > 0;

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    const sorted = entries.toSorted((a, b) => b.date.localeCompare(a.date));
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
          dispatch({ type: "SET_DELETING", entry: null });
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
            <Plus className="mr-2 size-4" />
            {t("journal.writeButton")}
          </Button>
        }
      />

      {/* Filter bar */}
      {entries && entries.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder={t("journal.searchPlaceholder")}
              value={search}
              onChange={(e) => dispatch({ type: "SET_SEARCH", search: e.target.value })}
              className="pl-9 md:pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.entries(tagConfig) as [
              JournalTag,
              (typeof tagConfig)[JournalTag],
            ][]).map(([tag, config]) => (
              <Badge
                key={tag}
                variant={filterTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTagFilter(tag)}
              >
                {t(config.labelKey)}
              </Badge>
            ))}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="size-3.5" />
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
            <BookOpen className="size-10 text-muted-foreground/50" />
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
              onDelete={(entry) => dispatch({ type: "SET_DELETING", entry })}
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
        onOpenChange={(open) => !open && dispatch({ type: "SET_DELETING", entry: null })}
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
