import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Plus,
  Trash2,
  Timer,
  ChevronDown,
  ChevronUp,
  Info,
  GripVertical,
} from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmojiPicker, ROUTINE_STEP_EMOJIS } from "@/components/emoji-picker";
import { useUiStore } from "@/stores/ui-store";
import {
  useUpsertRoutineSteps,
} from "@/hooks/use-routines";
import {
  type Routine,
} from "@focusflow/validators";

/** Reorderable step list for one routine, with keyboard fallbacks. */

export type StepDraft = {
  // Stable for the lifetime of the editor instance — used as React + dnd-kit
  // key. Distinct from `id` (which is undefined for newly added rows) so that
  // reordering keeps focus on the right input.
  dragId: string;
  id?: string;
  label: string;
  emoji: string | null;
  durationMinutes: number | null;
};

function newDragId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function StepsEditor({
  routine,
  onSuccess,
}: {
  routine: Routine;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId)!;
  const upsert = useUpsertRoutineSteps();

  const [barkleyInfoOpen, setBarkleyInfoOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const [steps, setSteps] = useState<StepDraft[]>(() =>
    routine.steps.map((s) => ({
      dragId: s.id,
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      durationMinutes: s.durationMinutes,
    })),
  );

  const focusLabelRef = useRef<string | null>(null);
  const labelRefs = useRef<Map<string, HTMLInputElement> | null>(null);
  if (labelRefs.current === null) {
    labelRefs.current = new Map<string, HTMLInputElement>();
  }

  useEffect(() => {
    const target = focusLabelRef.current;
    if (!target) return;
    const el = labelRefs.current!.get(target);
    if (el) {
      el.focus();
      focusLabelRef.current = null;
    }
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const update = useCallback(
    (dragId: string, patch: Partial<StepDraft>) =>
      setSteps((curr) =>
        curr.map((s) => (s.dragId === dragId ? { ...s, ...patch } : s)),
      ),
    [],
  );

  const remove = useCallback(
    (dragId: string) => {
      setSteps((curr) => {
        const idx = curr.findIndex((s) => s.dragId === dragId);
        if (idx === -1) return curr;
        const next = curr.filter((s) => s.dragId !== dragId);
        const focusTarget = next[idx]?.dragId ?? next[idx - 1]?.dragId ?? null;
        focusLabelRef.current = focusTarget;
        return next;
      });
      setLiveAnnouncement(t("routines.stepDeletedAnnouncement"));
    },
    [t],
  );

  const add = useCallback(() => {
    const dragId = newDragId();
    focusLabelRef.current = dragId;
    setSteps((curr) => [
      ...curr,
      { dragId, label: "", emoji: null, durationMinutes: null },
    ]);
    setLiveAnnouncement(t("routines.stepAddedAnnouncement"));
  }, [t]);

  const move = useCallback(
    (dragId: string, direction: -1 | 1) => {
      setSteps((curr) => {
        const idx = curr.findIndex((s) => s.dragId === dragId);
        const moved = curr[idx];
        const target = idx + direction;
        if (!moved || target < 0 || target >= curr.length) return curr;
        const next = arrayMove(curr, idx, target);
        setLiveAnnouncement(
          t("routines.stepReorderedAnnouncement", {
            label: moved.label || t("routines.stepUnnamed"),
            position: target + 1,
            total: curr.length,
          }),
        );
        return next;
      });
    },
    [t],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setSteps((curr) => {
        const oldIndex = curr.findIndex((s) => s.dragId === active.id);
        const newIndex = curr.findIndex((s) => s.dragId === over.id);
        const moved = curr[oldIndex];
        if (!moved || newIndex === -1) return curr;
        const next = arrayMove(curr, oldIndex, newIndex);
        setLiveAnnouncement(
          t("routines.stepReorderedAnnouncement", {
            label: moved.label || t("routines.stepUnnamed"),
            position: newIndex + 1,
            total: curr.length,
          }),
        );
        return next;
      });
    },
    [t],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = steps.reduce<
      { id?: string; emoji: string | null; durationMinutes: number | null; label: string }[]
    >((acc, s) => {
      const label = s.label.trim();
      if (label.length > 0) {
        acc.push({ id: s.id, emoji: s.emoji, durationMinutes: s.durationMinutes, label });
      }
      return acc;
    }, []);
    upsert.mutate(
      { id: routine.id, childId: activeChildId, steps: cleaned },
      { onSuccess },
    );
  };

  const sortableIds = steps.map((s) => s.dragId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("routines.stepsHint")}
        </p>
        <button
          type="button"
          onClick={() => setBarkleyInfoOpen(true)}
          className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-7"
        >
          <Info className="size-3.5" />
          <span className="underline underline-offset-2">
            {t("routines.stepsHintInfoLabel")}
          </span>
        </button>
      </div>

      <Dialog open={barkleyInfoOpen} onOpenChange={setBarkleyInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("routines.barkleyInfo.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              {t("routines.barkleyInfo.intro")}
            </p>
            <div className="space-y-2">
              <p className="font-semibold">
                {t("routines.barkleyInfo.benefitsTitle")}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground marker:text-primary">
                <li>{t("routines.barkleyInfo.benefit1")}</li>
                <li>{t("routines.barkleyInfo.benefit2")}</li>
                <li>{t("routines.barkleyInfo.benefit3")}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">
                {t("routines.barkleyInfo.rangeTitle")}
              </p>
              <p className="text-muted-foreground">
                {t("routines.barkleyInfo.rangeBody")}
              </p>
            </div>
            <div className="space-y-1 rounded-md bg-accent/50 p-3">
              <p className="font-semibold">
                {t("routines.barkleyInfo.exampleTitle")}
              </p>
              <p className="text-muted-foreground">
                {t("routines.barkleyInfo.exampleBody")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setBarkleyInfoOpen(false)}
            className="w-full"
          >
            {t("routines.barkleyInfo.close")}
          </Button>
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <SortableStepRow
                key={s.dragId}
                step={s}
                index={i}
                total={steps.length}
                onUpdate={(patch) => update(s.dragId, patch)}
                onRemove={() => remove(s.dragId)}
                onMoveUp={() => move(s.dragId, -1)}
                onMoveDown={() => move(s.dragId, 1)}
                registerLabelRef={(el) => {
                  if (el) labelRefs.current!.set(s.dragId, el);
                  else labelRefs.current!.delete(s.dragId);
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-full"
        disabled={steps.length >= 20}
      >
        <Plus className="mr-2 size-4" />
        {t("routines.addStep")}
      </Button>
      <Button type="submit" className="w-full" disabled={upsert.isPending}>
        {upsert.isPending ? t("routines.saving") : t("routines.saveSteps")}
      </Button>
    </form>
  );
}

function SortableStepRow({
  step,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  registerLabelRef,
}: {
  step: StepDraft;
  index: number;
  total: number;
  onUpdate: (patch: Partial<StepDraft>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  registerLabelRef: (el: HTMLInputElement | null) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.dragId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : undefined,
  };

  const labelForA11y =
    step.label.trim() || t("routines.stepUnnamedShort", { position: index + 1 });

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-background p-2 shadow-sm"
      aria-label={t("routines.stepRowLabel", {
        position: index + 1,
        total,
        label: labelForA11y,
      })}
    >
      {/* Top row: drag handle · position · emoji · label · delete */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t("routines.dragHandleLabel", { label: labelForA11y })}
          className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums"
        >
          {index + 1}
        </span>

        <EmojiPicker
          value={step.emoji ?? ""}
          onSelect={(emoji) =>
            onUpdate({ emoji: emoji === step.emoji ? null : emoji })
          }
          emojis={ROUTINE_STEP_EMOJIS}
          columns={6}
          placeholder="🙂"
        >
          <button
            type="button"
            aria-label={t("routines.stepEmojiLabel", { label: labelForA11y })}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {step.emoji || <span className="opacity-40 text-base">🙂</span>}
          </button>
        </EmojiPicker>

        <Input
          id={labelId}
          ref={registerLabelRef}
          value={step.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={t("routines.stepPlaceholder")}
          aria-label={t("routines.stepLabelInput", { position: index + 1 })}
          className="h-11 min-w-0 flex-1"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={t("routines.removeStepLabel", { label: labelForA11y })}
          className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Bottom row: move buttons · duration */}
      <div className="mt-1.5 flex items-center gap-1.5 pl-7">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label={t("routines.moveUpLabel", { label: labelForA11y })}
          className="size-9 shrink-0"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label={t("routines.moveDownLabel", { label: labelForA11y })}
          className="size-9 shrink-0"
        >
          <ChevronDown className="size-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-3.5" aria-hidden="true" />
          <label
            htmlFor={`${labelId}-duration`}
            className="cursor-pointer select-none"
          >
            {t("routines.stepDurationShort")}
          </label>
          <Input
            id={`${labelId}-duration`}
            type="number"
            min={1}
            max={180}
            inputMode="numeric"
            value={step.durationMinutes ?? ""}
            onChange={(e) =>
              onUpdate({
                durationMinutes: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            placeholder="—"
            aria-label={t("routines.stepDuration")}
            className="h-9 w-14 text-center"
          />
          <span aria-hidden="true">{t("routines.minutesShort")}</span>
        </div>
      </div>
    </li>
  );
}
