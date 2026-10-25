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

  const clearFilters = () => {
    setDimensionFilter("all");
  };

  const hasActiveFilters = dimensionFilter !== "all";

  const filteredSymptoms = useMemo(() => {
    if (!symptoms) return [];
    const sorted = symptoms.toSorted((a, b) => b.date.localeCompare(a.date));
    if (!hasActiveFilters) return sorted;

    const activeDim = dimensionFilter as Exclude<DimensionFilter, "all">;
    return sorted.filter((s) => {
      const highIsBad = ["agitation", "impulse"].includes(activeDim);
      const value = s[activeDim as keyof Symptom] as number;
      if (highIsBad && value < 7) return false;
      if (!highIsBad && value > 4) return false;
      return true;
    });
  }, [symptoms, dimensionFilter, hasActiveFilters]);

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
            onChange={setDimensionFilter}
            clear={{
              label: t("symptoms.clearFilters"),
              onClear: clearFilters,
              visible: hasActiveFilters,
            }}
          />
          {/* Annonce le résultat d'un filtre sans déplacer le focus. */}
          <p aria-live="polite" className="sr-only">
            {t("symptoms.resultCount", { count: filteredSymptoms.length })}
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
