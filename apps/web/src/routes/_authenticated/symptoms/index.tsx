import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { SymptomCard } from "@/components/symptoms/symptom-card";
import { useSymptoms } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import type { Symptom } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/symptoms/")({
  component: SymptomsPage,
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
    const sorted = [...symptoms].sort((a, b) => b.date.localeCompare(a.date));
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("symptoms.title")}
          </h1>
          <p className="text-muted-foreground">{t("symptoms.subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("symptoms.addButton")}
        </Button>
      </div>

      {/* Filter bar */}
      {symptoms && symptoms.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {DIMENSION_FILTERS.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                variant={dimensionFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setDimensionFilter(key)}
              >
                {label}
              </Button>
            ))}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                {t("symptoms.clearFilters")}
              </Button>
            )}
          </div>
        </div>
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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("symptoms.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !symptoms?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("symptoms.emptyState")}
          </CardContent>
        </Card>
      ) : filteredSymptoms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("symptoms.noMatch")}</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t("symptoms.clearFiltersButton")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSymptoms.map((symptom) => (
            <SymptomCard
              key={symptom.id}
              symptom={symptom}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
