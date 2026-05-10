import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type SequenceTemplate,
  generateCustomSequenceId,
} from "./sequences";

// Curated emoji set for routine cards. Kept short so the choice doesn't
// add cognitive load on a tired parent — the goal is "create the routine
// fast", not "decorate it".
const CUSTOM_ROUTINE_EMOJIS = [
  "📋",
  "🌅",
  "🌙",
  "📚",
  "🍽️",
  "🛁",
  "🚌",
  "⚽",
  "🎨",
  "💪",
] as const;

const MIN_STEPS = 2;
const MAX_STEPS = 6;
const MIN_STEP_MINUTES = 1;
const MAX_STEP_MINUTES = 60;

type DraftStep = {
  name: string;
  minutes: number;
};

export function CustomSequenceDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (seq: SequenceTemplate) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>(CUSTOM_ROUTINE_EMOJIS[0]!);
  const [steps, setSteps] = useState<DraftStep[]>([
    { name: "", minutes: 10 },
    { name: "", minutes: 5 },
  ]);

  const resetForm = () => {
    setName("");
    setEmoji(CUSTOM_ROUTINE_EMOJIS[0]!);
    setSteps([
      { name: "", minutes: 10 },
      { name: "", minutes: 5 },
    ]);
  };

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const updateStep = (index: number, patch: Partial<DraftStep>) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const addStep = () => {
    if (steps.length >= MAX_STEPS) return;
    setSteps((prev) => [...prev, { name: "", minutes: 5 }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= MIN_STEPS) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const trimmedName = name.trim();
  const validSteps = steps
    .map((s) => ({ name: s.name.trim(), minutes: s.minutes }))
    .filter(
      (s) =>
        s.name.length > 0 &&
        Number.isFinite(s.minutes) &&
        s.minutes >= MIN_STEP_MINUTES &&
        s.minutes <= MAX_STEP_MINUTES
    );
  const isValid = trimmedName.length > 0 && validSteps.length >= MIN_STEPS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const seq: SequenceTemplate = {
      id: generateCustomSequenceId(),
      labelKey: trimmedName,
      emoji,
      steps: validSteps.map((s) => ({
        labelKey: s.name,
        durationSec: s.minutes * 60,
      })),
      custom: true,
    };
    onCreate(seq);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("timer.customRoutine.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routine-name">
              {t("timer.customRoutine.nameLabel")}
            </Label>
            <Input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("timer.customRoutine.namePlaceholder")}
              required
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("timer.customRoutine.emojiLabel")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOM_ROUTINE_EMOJIS.map((e) => {
                const active = emoji === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    aria-pressed={active}
                    aria-label={e}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border/60 bg-background hover:bg-accent"
                    )}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("timer.customRoutine.stepsLabel")}</Label>
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 rounded-md border border-border/60 bg-background p-2"
                >
                  <span className="text-xs font-medium text-muted-foreground w-5 text-center">
                    {index + 1}
                  </span>
                  <Input
                    value={step.name}
                    onChange={(e) =>
                      updateStep(index, { name: e.target.value })
                    }
                    placeholder={t("timer.customRoutine.stepNamePlaceholder")}
                    maxLength={30}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={MIN_STEP_MINUTES}
                    max={MAX_STEP_MINUTES}
                    value={step.minutes}
                    onChange={(e) =>
                      updateStep(index, {
                        minutes: Math.max(
                          MIN_STEP_MINUTES,
                          Math.min(
                            MAX_STEP_MINUTES,
                            Number(e.target.value) || MIN_STEP_MINUTES
                          )
                        ),
                      })
                    }
                    className="w-16"
                    aria-label={t("timer.customRoutine.stepDurationLabel", {
                      index: index + 1,
                    })}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("timer.minutesAbbrev")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    disabled={steps.length <= MIN_STEPS}
                    aria-label={t("timer.customRoutine.removeStep", {
                      index: index + 1,
                    })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground/50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            {steps.length < MAX_STEPS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("timer.customRoutine.addStep")}
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!isValid}>
              {t("timer.customRoutine.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
