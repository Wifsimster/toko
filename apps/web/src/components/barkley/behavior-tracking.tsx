import { useState, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Shuffle,
  GripVertical,
  Save,
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
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EmojiPicker } from "@/components/emoji-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBarkleyLogs,
  useCreateBarkleyBehavior,
  useDeleteBarkleyBehavior,
  useToggleBarkleyLog,
  useReorderBarkleyBehaviors,
} from "@/hooks/use-barkley";
import type { BarkleyBehavior } from "@focusflow/validators";
import { useChild } from "@/hooks/use-children";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const BARKLEY_TIPS = [
  { title: "Immédiateté", desc: "Étoile juste après le geste" },
  { title: "Positivité", desc: "Jamais retirer une étoile" },
  { title: "Régularité", desc: "Chaque jour avec votre enfant" },
  { title: "Progressivité", desc: "2-3 gestes au début" },
  { title: "Valorisation", desc: "Un bravo à chaque étoile" },
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0] as string;
}

function formatWeekLabel(monday: Date): string {
  return `Semaine du ${monday.getDate()} ${monday.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
}

export function BehaviorTracking({ childId }: { childId: string }) {
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMonday(new Date())
  );
  const [behaviorDialogOpen, setBehaviorDialogOpen] = useState(false);

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
  const logs = data?.logs ?? [];

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
        if (isChecked(b.id, date)) total++;
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
      {/* Personalized header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-6 py-5 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 95}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
                opacity: 0.4 + Math.random() * 0.6,
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        <div className="relative text-center">
          <h2 className="text-2xl font-bold font-heading">
            ⭐ Le Tableau de {childName} ⭐
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevWeek}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setCurrentMonday(getMonday(new Date()))}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              title="Cette semaine"
            >
              {formatWeekLabel(currentMonday)}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {formatDate(currentMonday) !== formatDate(getMonday(new Date())) && (
            <button
              onClick={() => setCurrentMonday(getMonday(new Date()))}
              className="mt-1 text-xs text-white/70 hover:text-white transition-colors underline underline-offset-2"
            >
              Cette semaine
            </button>
          )}
          {maxStars > 0 && (
            <p className="mt-1 text-sm text-white/80">
              {weeklyStars} / {maxStars} ⭐ cette semaine
            </p>
          )}
        </div>
      </div>

      {/* Behavior tracking grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Comportements
          </h3>
          <Dialog
            open={behaviorDialogOpen}
            onOpenChange={setBehaviorDialogOpen}
          >
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Ajouter
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau comportement</DialogTitle>
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
              <p>
                Ajoutez des comportements pour commencer le suivi
                hebdomadaire.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Save / Cancel order buttons */}
            {hasOrderChanged && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelOrder}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={reorderBehaviors.isPending}
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {reorderBehaviors.isPending ? "Enregistrement..." : "Mettre à jour l'ordre"}
                </Button>
              </div>
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
                <Card className="hidden sm:block overflow-hidden">
                  <div className="grid grid-cols-[28px_1fr_repeat(7,_minmax(36px,_1fr))_40px] border-b bg-muted/50 px-3 py-2">
                    <div />
                    <div className="text-xs font-medium text-muted-foreground" />
                    {DAY_LABELS.map((day, i) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-muted-foreground"
                      >
                        <div>{day}</div>
                        <div className="text-[10px] text-muted-foreground/60">
                          {new Date(weekDates[i]! + "T00:00:00").getDate()}
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

      {/* Barkley tips */}
      <Card className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/40 dark:border-indigo-800/30">
        <CardContent className="py-3 px-4">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            Conseils Barkley
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {BARKLEY_TIPS.map((tip) => (
              <p key={tip.title} className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {tip.title}
                </span>
                {" — "}
                {tip.desc}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sortable Behavior Row (Desktop) ─────────────────────

function SortableBehaviorRow({
  behavior,
  isLast,
  weekDates,
  isChecked,
  onToggle,
  onDelete,
  togglePending,
  deletePending,
}: {
  behavior: BarkleyBehavior;
  isLast: boolean;
  weekDates: string[];
  isChecked: (behaviorId: string, date: string) => boolean;
  onToggle: (behaviorId: string, date: string) => void;
  onDelete: () => void;
  togglePending: boolean;
  deletePending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: behavior.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[28px_1fr_repeat(7,_minmax(36px,_1fr))_40px] items-center px-3 py-2.5 ${
        !isLast ? "border-b" : ""
      } hover:bg-muted/30 transition-colors ${isDragging ? "opacity-50 bg-muted/50 z-10" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">
          {behavior.icon || "✅"}
        </span>
        <span className="text-sm font-medium truncate">
          {behavior.name}
        </span>
      </div>

      {weekDates.map((date) => {
        const checked = isChecked(behavior.id, date);
        return (
          <div key={date} className="flex justify-center">
            <button
              onClick={() => onToggle(behavior.id, date)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                checked
                  ? "scale-110"
                  : "hover:bg-muted/50 hover:scale-105"
              }`}
              disabled={togglePending}
              title={checked ? "Retirer l'étoile" : "Ajouter une étoile"}
            >
              {checked ? (
                <span className="text-xl leading-none">⭐</span>
              ) : (
                <span className="text-muted-foreground/30 text-lg leading-none">
                  ☆
                </span>
              )}
            </button>
          </div>
        );
      })}

      <div className="flex justify-center">
        <button
          onClick={onDelete}
          className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded"
          disabled={deletePending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Sortable Behavior Card (Mobile) ─────────────────────

function SortableBehaviorCard({
  behavior,
  weekDates,
  dayLabels,
  isChecked,
  onToggle,
  onDelete,
  togglePending,
  deletePending,
}: {
  behavior: BarkleyBehavior;
  weekDates: string[];
  dayLabels: string[];
  isChecked: (behaviorId: string, date: string) => boolean;
  onToggle: (behaviorId: string, date: string) => void;
  onDelete: () => void;
  togglePending: boolean;
  deletePending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: behavior.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`overflow-hidden ${isDragging ? "opacity-50 shadow-lg" : ""}`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="text-lg shrink-0">
                {behavior.icon || "✅"}
              </span>
              <span className="text-sm font-semibold truncate">
                {behavior.name}
              </span>
            </div>
            <button
              onClick={onDelete}
              className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded shrink-0"
              disabled={deletePending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex justify-between gap-1">
            {weekDates.map((date, i) => {
              const checked = isChecked(behavior.id, date);
              return (
                <button
                  key={date}
                  onClick={() => onToggle(behavior.id, date)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 transition-all flex-1 min-w-0 ${
                    checked
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "hover:bg-muted/50"
                  }`}
                  disabled={togglePending}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {dayLabels[i]}
                  </span>
                  {checked ? (
                    <span className="text-lg leading-none">⭐</span>
                  ) : (
                    <span className="text-muted-foreground/30 text-lg leading-none">
                      ☆
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Behavior Suggestions ─────────────────────────────────

const BEHAVIOR_SUGGESTIONS = [
  { icon: "🧹", name: "Je range ma chambre" },
  { icon: "🦷", name: "Je me brosse les dents" },
  { icon: "🎒", name: "Je prépare mon cartable" },
  { icon: "🍽️", name: "Je mets la table" },
  { icon: "👕", name: "Je m'habille tout seul" },
  { icon: "📚", name: "Je fais mes devoirs" },
  { icon: "🛏️", name: "Je fais mon lit" },
  { icon: "🤝", name: "Je partage avec les autres" },
  { icon: "🙋", name: "Je lève la main pour parler" },
  { icon: "🧘", name: "Je reste calme quand je suis frustré" },
  { icon: "👂", name: "J'écoute les consignes" },
  { icon: "🚿", name: "Je prends ma douche" },
  { icon: "🐕", name: "Je m'occupe de l'animal" },
  { icon: "🗣️", name: "Je dis s'il te plaît et merci" },
  { icon: "⏰", name: "Je suis prêt à l'heure" },
  { icon: "🤫", name: "Je parle doucement" },
  { icon: "🧹", name: "Je débarrasse mon assiette" },
  { icon: "💪", name: "Je termine ce que j'ai commencé" },
  { icon: "😊", name: "Je gère ma colère sans crier" },
  { icon: "🎨", name: "Je range mes affaires après une activité" },
];

// ─── Behavior Form ────────────────────────────────────────

function BehaviorForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const createBehavior = useCreateBarkleyBehavior();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBehavior.mutate(
      {
        childId,
        name,
        points: 1,
        icon: icon || undefined,
      },
      { onSuccess }
    );
  };

  const handlePickSuggestion = (suggestion: { icon: string; name: string }) => {
    setIcon(suggestion.icon);
    setName(suggestion.name);
    setShowSuggestions(false);
  };

  const pickRandom = () => {
    const s =
      BEHAVIOR_SUGGESTIONS[
        Math.floor(Math.random() * BEHAVIOR_SUGGESTIONS.length)
      ]!;
    setIcon(s.icon);
    setName(s.name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="beh-name">Nom du comportement</Label>
        <InputGroup>
          <EmojiPicker value={icon} onSelect={setIcon} placeholder="🧹" />
          <InputGroupInput
            id="beh-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Je range ma chambre"
            required
          />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton onClick={pickRandom}>
                    <Shuffle className="h-3.5 w-3.5" />
                  </InputGroupButton>
                }
              />
              <TooltipContent>Suggestion au hasard</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {showSuggestions ? "Masquer les idées" : "Des idées ?"}
      </Button>

      {showSuggestions && (
        <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto rounded-lg border p-2">
          {BEHAVIOR_SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!name || createBehavior.isPending}
      >
        {createBehavior.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
