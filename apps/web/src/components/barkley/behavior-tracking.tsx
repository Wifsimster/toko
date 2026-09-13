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
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
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
import { useChild } from "@/hooks/use-children";
import { getMonday, formatDate } from "./behavior-week";
import { SortableBehaviorRow } from "./sortable-behavior-row";
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
  // Capture "this week's monday" once at mount so the render is deterministic
  const thisMondayRef = useRef<Date | null>(null);
  if (thisMondayRef.current === null) {
    thisMondayRef.current = getMonday(new Date());
  }

  const [localOrder, setLocalOrder] = useState<BarkleyBehavior[] | null>(null);

  const { data: child } = useChild(childId);
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
  const childName = child?.name ?? "...";

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      <BehaviorWeekHeader
        childName={t("behaviorTracking.headerTitle", { name: childName })}
        weekLabel={formatWeekLabel(currentMonday)}
        isCurrentWeek={formatDate(currentMonday) === formatDate(thisMondayRef.current!)}
        weeklyStars={weeklyStars}
        maxStars={maxStars}
        thisWeekLabel={t("behaviorTracking.thisWeek")}
        starsLabel={t("behaviorTracking.starsThisWeek", { earned: weeklyStars, max: maxStars })}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onGoToThisWeek={() => setCurrentMonday(thisMondayRef.current!)}
      />

      {/* Behavior tracking grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("behaviorTracking.behaviors")}
          </h3>
          <Dialog
            open={behaviorDialogOpen}
            onOpenChange={setBehaviorDialogOpen}
          >
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  <Plus className="mr-1.5 size-3.5" />
                  {t("behaviorTracking.addButton")}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("behaviorTracking.newBehavior")}</DialogTitle>
              </DialogHeader>
              <BehaviorForm
                childId={childId}
                onSuccess={() => setBehaviorDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {behaviors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>{t("behaviorTracking.emptyState")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Save / Cancel order buttons */}
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

            {/* Desktop grid view */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={behaviors.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Card className="hidden sm:block overflow-x-auto">
                  <div className="grid min-w-[640px] grid-cols-[28px_1fr_repeat(7,_minmax(36px,_1fr))_40px] border-b bg-muted/50 px-3 py-2">
                    <div />
                    <div className="text-xs font-medium text-muted-foreground" />
                    {DAY_LABELS.map((day, i) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-muted-foreground"
                      >
                        <div>{day}</div>
                        <div className="text-xs text-muted-foreground/60">
                          {weekDayNumbers[i]}
                        </div>
                      </div>
                    ))}
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

                {/* Mobile card view */}
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
    </div>
  );
}
