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
import type { Symptom, SymptomValues } from "@focusflow/validators";
import { SymptomTodayPanel } from "@/components/symptoms/today-panel";
import { useChildren } from "@/hooks/use-children";

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
  const [startValues, setStartValues] = useState<SymptomValues | undefined>(undefined);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms, isLoading } = useSymptoms(activeChildId ?? "");
  const { data: children } = useChildren();
  const activeChild = children?.find((c) => c.id === activeChildId);

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
    setStartValues(undefined);
    setDialogOpen(true);
  };

  const openRefine = (values: SymptomValues) => {
    setEditingItem(null);
    setStartValues(values);
    setDialogOpen(true);
  };

  const openEdit = (symptom: Symptom) => {
    setEditingItem(symptom);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setStartValues(undefined);
  };

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
        title={
          activeChild?.name
            ? t("symptoms.today.pageTitle", { name: activeChild.name })
            : t("symptoms.title")
        }
        description={t("symptoms.today.pageSubtitle")}
        actions={
          <Button variant="outline" size="lg" className="md:h-11 md:px-4" onClick={openCreate}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("symptoms.today.otherDay")}
          </Button>
        }
      />

      {activeChildId && !isLoading && (
        <SymptomTodayPanel
          childId={activeChildId}
          entries={symptoms ?? []}
          onRefine={openRefine}
          onEdit={openEdit}
        />
      )}

      {symptoms && symptoms.length > 0 && (
        <>
          <h2 id="symptom-history-title" className="pt-2 text-lg font-extrabold">{t("symptoms.today.history")}</h2>
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
            key={editingItem?.id ?? (startValues ? JSON.stringify(startValues) : "create")}
            initialData={editingItem}
            initialValues={startValues}
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
      ) : !symptoms?.length ? null : filteredSymptoms.length === 0 ? (
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
        <div className="grid gap-3" data-testid="symptom-history" aria-labelledby="symptom-history-title" role="region">
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
