import { useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
} from "lucide-react";
import { BehaviorWeekHeader } from "./behavior-week-header";
import { BehaviorOrderBar } from "./behavior-order-bar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBarkleyLogs,
  useDeleteBarkleyBehavior,
  useToggleBarkleyLog,
  useReorderBarkleyBehaviors,
} from "@/hooks/use-barkley";
import type { BarkleyBehavior } from "@focusflow/validators";
import { getMonday, formatDate } from "./behavior-week";
import { BEHAVIOR_GRID, SortableBehaviorRow } from "./sortable-behavior-row";
import { SortableBehaviorCard } from "./sortable-behavior-card";
import { BehaviorForm } from "./behavior-form";

export function BehaviorTracking({ childId }: { childId: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const DAY_LABELS = [
    t("days.monShort"),
    t("days.tueShort"),
    t("days.wedShort"),
    t("days.thuShort"),
    t("days.friShort"),
    t("days.satShort"),
    t("days.sunShort"),
  ];
  const formatWeekLabel = (monday: Date): string =>
    t("behaviorTracking.weekOf", {
      day: monday.getDate(),
      monthYear: monday.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      }),
    });
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMonday(new Date())
  );
  const [behaviorDialogOpen, setBehaviorDialogOpen] = useState(false);
  const thisMondayRef = useRef<Date | null>(null);
  if (thisMondayRef.current === null) {
    thisMondayRef.current = getMonday(new Date());
  }

  const [localOrder, setLocalOrder] = useState<BarkleyBehavior[] | null>(null);

  const week = formatDate(currentMonday);
  const { data, isLoading } = useBarkleyLogs(childId, week);
  const toggleLog = useToggleBarkleyLog();
  const deleteBehavior = useDeleteBarkleyBehavior();
  const reorderBehaviors = useReorderBarkleyBehaviors();

  const serverBehaviors = useMemo(
    () => data?.behaviors?.filter((b) => b.active) ?? [],
    [data?.behaviors]
  );
  const behaviors = localOrder ?? serverBehaviors;
  const logs = useMemo(() => data?.logs ?? [], [data]);

  const hasOrderChanged = localOrder !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const current = localOrder ?? serverBehaviors;
      const oldIndex = current.findIndex((b) => b.id === active.id);
      const newIndex = current.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      setLocalOrder(arrayMove(current, oldIndex, newIndex));
    },
    [localOrder, serverBehaviors]
  );

  const handleSaveOrder = useCallback(() => {
    if (!localOrder) return;
    reorderBehaviors.mutate(
      { childId, orderedIds: localOrder.map((b) => b.id) },
      { onSuccess: () => setLocalOrder(null) }
    );
  }, [localOrder, childId, reorderBehaviors]);

  const handleCancelOrder = useCallback(() => {
    setLocalOrder(null);
  }, []);

  const logMap = useMemo(() => {
    const map = new Map<string, Map<string, boolean>>();
    logs.forEach((l) => {
      if (!map.has(l.behaviorId)) map.set(l.behaviorId, new Map());
      map.get(l.behaviorId)!.set(l.date, l.completed);
    });
    return map;
  }, [logs]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      return formatDate(d);
    });
  }, [currentMonday]);

  const weekDayNumbers = useMemo(
    () => weekDates.map((dateStr) => new Date(dateStr + "T00:00:00").getDate()),
    [weekDates],
  );

  const isChecked = (behaviorId: string, date: string) =>
    logMap.get(behaviorId)?.get(date) ?? false;

  const handleToggle = (behaviorId: string, date: string) => {
    const current = isChecked(behaviorId, date);
    toggleLog.mutate({
      behaviorId,
      date,
      completed: !current,
      childId,
      week,
    });
  };

  const handlePrevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  };

  const weeklyStars = useMemo(() => {
    let total = 0;
    behaviors.forEach((b) => {
      weekDates.forEach((date) => {
        if (logMap.get(b.id)?.get(date) ?? false) total++;
      });
    });
    return total;
  }, [behaviors, weekDates, logMap]);

  const maxStars = behaviors.length * 7;
  const today = formatDate(new Date());

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <section aria-labelledby="behaviors-title" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="behaviors-title" className="font-heading text-xl font-extrabold">
            {t("behaviorTracking.behaviors")}
          </h2>
          {maxStars > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("behaviorTracking.starsThisWeek", { count: weeklyStars, earned: weeklyStars })}
            </p>
          )}
        </div>
        <Dialog open={behaviorDialogOpen} onOpenChange={setBehaviorDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="outline">
                <Plus className="mr-1.5 size-4" />
                {t("behaviorTracking.addButton")}
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("behaviorTracking.newBehavior")}</DialogTitle>
            </DialogHeader>
            <BehaviorForm childId={childId} onSuccess={() => setBehaviorDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <BehaviorWeekHeader
        weekLabel={formatWeekLabel(currentMonday)}
        isCurrentWeek={formatDate(currentMonday) === formatDate(thisMondayRef.current!)}
        thisWeekLabel={t("behaviorTracking.thisWeek")}
        prevLabel={t("behaviorTracking.prevWeek")}
        nextLabel={t("behaviorTracking.nextWeek")}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onGoToThisWeek={() => setCurrentMonday(thisMondayRef.current!)}
      />

      <div className="space-y-3">
        {behaviors.length === 0 ? (
          <EmptyState title={t("behaviorTracking.emptyTitle")} description={t("behaviorTracking.emptyState")} />
        ) : (
          <>
            {hasOrderChanged && (
              <BehaviorOrderBar
                isPending={reorderBehaviors.isPending}
                cancelLabel={t("behaviorTracking.cancelOrder")}
                saveLabel={t("behaviorTracking.saveOrder")}
                savingLabel={t("behaviorTracking.savingOrder")}
                onCancel={handleCancelOrder}
                onSave={handleSaveOrder}
              />
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={behaviors.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Card className="hidden gap-0 overflow-x-auto py-0 sm:block">
                  <div className={`${BEHAVIOR_GRID} border-b bg-muted/50 px-3 py-2.5`}>
                    <div />
                    <div />
                    {DAY_LABELS.map((day, i) => {
                      const isToday = weekDates[i] === today;
                      return (
                        <div
                          key={day}
                          aria-current={isToday ? "date" : undefined}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className={`text-xs font-semibold ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                            {day}
                          </span>
                          <span
                            className={`flex size-7 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                              isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                            }`}
                          >
                            {weekDayNumbers[i]}
                          </span>
                        </div>
                      );
                    })}
                    <div />
                  </div>

                  {behaviors.map((behavior, idx) => (
                    <SortableBehaviorRow
                      key={behavior.id}
                      behavior={behavior}
                      isLast={idx === behaviors.length - 1}
                      weekDates={weekDates}
                      isChecked={isChecked}
                      onToggle={handleToggle}
                      onDelete={() =>
                        deleteBehavior.mutate({ id: behavior.id, childId })
                      }
                      togglePending={toggleLog.isPending}
                      deletePending={deleteBehavior.isPending}
                    />
                  ))}
                </Card>

                <div className="sm:hidden space-y-3">
                  {behaviors.map((behavior) => (
                    <SortableBehaviorCard
                      key={behavior.id}
                      behavior={behavior}
                      weekDates={weekDates}
                      dayLabels={DAY_LABELS}
                      isChecked={isChecked}
                      onToggle={handleToggle}
                      onDelete={() =>
                        deleteBehavior.mutate({ id: behavior.id, childId })
                      }
                      togglePending={toggleLog.isPending}
                      deletePending={deleteBehavior.isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </section>
  );
}
