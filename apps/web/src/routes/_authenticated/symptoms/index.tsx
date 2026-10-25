import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { SymptomCard } from "@/components/symptoms/symptom-card";
import { useSymptoms } from "@/hooks/use-symptoms";
import { HistoryLimitNotice } from "@/components/shared/history-limit-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { useUiStore } from "@/stores/ui-store";
import type { Symptom } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/symptoms/")({
  component: SymptomsPage,
  staticData: {
    crumb: "nav.symptoms",
  },
});

type DimensionFilter =
  | "all"
  | "agitation"
  | "focus"
  | "impulse"
  | "mood"
  | "sleep";

// Relevés du plus récent au plus ancien, filtrés sur une dimension
// difficile (agitation ou impulsivité ≥ 7, humeur ou sommeil ≤ 4).
function filterSymptoms(symptoms: Symptom[], filter: DimensionFilter): Symptom[] {
  const sorted = symptoms.toSorted((a, b) => b.date.localeCompare(a.date));
  if (filter === "all") return sorted;
  const highIsBad = filter === "agitation" || filter === "impulse";
  return sorted.filter((s) => {
    const value = s[filter];
    return highIsBad ? value >= 7 : value <= 4;
  });
}

function SymptomsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Symptom | null>(null);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms, isLoading } = useSymptoms(activeChildId ?? "");

  const [dimensionFilter, setDimensionFilter] = useState<DimensionFilter>("all");

  const DIMENSION_FILTERS: { key: DimensionFilter; label: string }[] = [
    { key: "all", label: t("symptoms.filterAll") },
    { key: "agitation", label: t("symptoms.filterHighAgitation") },
    { key: "impulse", label: t("symptoms.filterHighImpulse") },
    { key: "mood", label: t("symptoms.filterHardMood") },
    { key: "sleep", label: t("symptoms.filterBadSleep") },
  ];

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (symptom: Symptom) => {
    setEditingItem(symptom);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  // Le nombre de relevés n'est annoncé qu'après un changement de filtre :
  // au chargement, la liste parle d'elle-même.
  const [announcement, setAnnouncement] = useState("");
  const changeFilter = (filter: DimensionFilter) => {
    setDimensionFilter(filter);
    setAnnouncement(
      t("symptoms.resultCount", {
        count: filterSymptoms(symptoms ?? [], filter).length,
      }),
    );
  };

  const clearFilters = () => changeFilter("all");

  const hasActiveFilters = dimensionFilter !== "all";

  const filteredSymptoms = useMemo(
    () => filterSymptoms(symptoms ?? [], dimensionFilter),
    [symptoms, dimensionFilter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("symptoms.title")}
        description={t("symptoms.subtitle")}
        actions={
          <Button size="lg" className="md:h-11 md:px-4" onClick={openCreate}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("symptoms.addButton")}
          </Button>
        }
      />

      {symptoms && symptoms.length > 0 && (
        <>
          <FilterChips
            label={t("symptoms.filterLabel")}
            options={DIMENSION_FILTERS}
            value={dimensionFilter}
            onChange={changeFilter}
            clear={{
              label: t("symptoms.clearFilters"),
              onClear: clearFilters,
              visible: hasActiveFilters,
            }}
          />
          {/* Annonce le résultat d'un filtre sans déplacer le focus. */}
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("symptoms.editTitle") : t("symptoms.newTitle")}
            </DialogTitle>
          </DialogHeader>
          <SymptomForm
            key={editingItem?.id ?? "create"}
            initialData={editingItem}
            existingEntries={symptoms ?? []}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>

      {!activeChildId ? (
        <EmptyState
          title={t("symptoms.selectChildTitle")}
          description={t("symptoms.selectChild")}
        />
      ) : isLoading ? (
        <PageLoader />
      ) : !symptoms?.length ? (
        <EmptyState
          title={t("symptoms.emptyTitle")}
          description={t("symptoms.emptyState")}
          note={t("symptoms.emptyNote")}
        />
      ) : filteredSymptoms.length === 0 ? (
        <EmptyState
          mo="calme"
          title={t("symptoms.noMatch")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t("symptoms.clearFiltersButton")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {filteredSymptoms.map((symptom) => (
            <SymptomCard
              key={symptom.id}
              symptom={symptom}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {symptoms && symptoms.length > 0 ? <HistoryLimitNotice /> : null}
    </div>
  );
}
