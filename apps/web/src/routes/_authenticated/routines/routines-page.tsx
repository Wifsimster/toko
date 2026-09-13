import { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Plus,
  Sparkles,
  Heart,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useUiStore } from "@/stores/ui-store";
import {
  useRoutines,
  useRoutineCompletions,
  useAdoptRoutineTemplate,
} from "@/hooks/use-routines";
import {
  type Routine,
  type RoutineTemplate,
} from "@focusflow/validators";
import { DIALOG_INITIAL, dialogReducer } from "./dialog-state";
import { todayDayOfWeek, todayIso } from "./routine-schedule";
import { RoutineCard } from "./routine-card";
import { RoutineForm } from "./routine-form";
import { StepsEditor } from "./steps-editor";
import { TemplatesList } from "./templates-list";

const PATIENCE_DISMISSED_KEY = "toko.routines.patience-dismissed";

export default function RoutinesPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const today = todayIso();

  const { data: routines, isLoading } = useRoutines(activeChildId ?? "");
  const { data: completions } = useRoutineCompletions(
    activeChildId ?? "",
    today,
  );
  const adoptTemplate = useAdoptRoutineTemplate();

  const [dialogs, dispatchDialog] = useReducer(dialogReducer, DIALOG_INITIAL);
  const { routineDialogOpen, editingRoutine, stepEditorRoutine, templatesOpen } = dialogs;
  const [patienceVisible, setPatienceVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(PATIENCE_DISMISSED_KEY);
    if (dismissed === "1") return;
    if ((routines?.length ?? 0) > 0) setPatienceVisible(true);
  }, [routines?.length]);

  const dismissPatience = () => {
    setPatienceVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PATIENCE_DISMISSED_KEY, "1");
    }
  };

  const handleAdoptTemplate = (template: RoutineTemplate) => {
    if (!activeChildId) return;
    adoptTemplate.mutate(
      { childId: activeChildId, templateKey: template.key },
      {
        onSuccess: (created) => {
          dispatchDialog({ type: "setTemplatesOpen", open: false });
          toast.success(
            t("routines.templates.adoptedToast", { name: template.title }),
            {
              action: {
                label: t("routines.templates.personalize"),
                onClick: () => dispatchDialog({ type: "setStepEditor", routine: created }),
              },
            },
          );
        },
      },
    );
  };

  const completedStepIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.stepId)),
    [completions],
  );

  const dow = todayDayOfWeek();
  const todaysRoutines = useMemo(() => {
    return (routines ?? []).filter((r) => {
      if (!r.active) return false;
      if (r.daysOfWeek.length === 0) return true;
      return r.daysOfWeek.includes(dow);
    });
  }, [routines, dow]);

  const otherRoutines = useMemo(() => {
    return (routines ?? []).filter((r) => !todaysRoutines.includes(r));
  }, [routines, todaysRoutines]);

  const openCreate = () => dispatchDialog({ type: "openCreate" });
  const openEdit = (r: Routine) => dispatchDialog({ type: "openEdit", routine: r });
  const closeDialog = () => dispatchDialog({ type: "closeRoutineDialog" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("routines.title")}
        description={t("routines.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => dispatchDialog({ type: "setTemplatesOpen", open: true })}
              disabled={!activeChildId}
            >
              <Sparkles className="mr-2 size-4" />
              {t("routines.templates.fromTemplateButton")}
            </Button>
            <Button onClick={openCreate} disabled={!activeChildId}>
              <Plus className="mr-2 size-4" />
              {t("routines.addButton")}
            </Button>
          </div>
        }
      />

      <Dialog
        open={templatesOpen}
        onOpenChange={(open) => dispatchDialog({ type: "setTemplatesOpen", open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("routines.templates.modalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("routines.templates.modalIntro")}
          </p>
          <TemplatesList
            onPick={handleAdoptTemplate}
            disabled={adoptTemplate.isPending || !activeChildId}
            initiallyExpanded
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={routineDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoutine
                ? t("routines.editTitle")
                : t("routines.newTitle")}
            </DialogTitle>
          </DialogHeader>
          <RoutineForm
            key={editingRoutine?.id ?? "create"}
            initialData={editingRoutine}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!stepEditorRoutine}
        onOpenChange={(open) => !open && dispatchDialog({ type: "setStepEditor", routine: null })}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("routines.stepsEditorTitle", {
                name: stepEditorRoutine?.name ?? "",
              })}
            </DialogTitle>
          </DialogHeader>
          {stepEditorRoutine && (
            <StepsEditor
              key={stepEditorRoutine.id}
              routine={stepEditorRoutine}
              onSuccess={() => dispatchDialog({ type: "setStepEditor", routine: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("routines.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !routines?.length ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">
              {t("routines.templates.startHereHeading")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("routines.templates.startHereIntro")}
            </p>
          </div>
          <TemplatesList
            onPick={handleAdoptTemplate}
            disabled={adoptTemplate.isPending}
          />
          <button
            type="button"
            onClick={openCreate}
            className="block w-full rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Plus className="mr-1 inline size-4" />
            {t("routines.templates.createFromScratch")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {patienceVisible && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Heart
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">
                  {t("routines.templates.patienceTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("routines.templates.patienceBody")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissPatience}
                aria-label={t("routines.templates.patienceDismiss")}
                className="shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("routines.todaySection")}
            </h2>
            {todaysRoutines.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  {t("routines.noneToday")}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {todaysRoutines.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    today={today}
                    completedStepIds={completedStepIds}
                    onEdit={() => openEdit(r)}
                    onEditSteps={() => dispatchDialog({ type: "setStepEditor", routine: r })}
                  />
                ))}
              </div>
            )}
          </section>

          {otherRoutines.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("routines.otherSection")}
              </h2>
              <div className="grid gap-3">
                {otherRoutines.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    today={today}
                    completedStepIds={completedStepIds}
                    onEdit={() => openEdit(r)}
                    onEditSteps={() => dispatchDialog({ type: "setStepEditor", routine: r })}
                    muted
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
