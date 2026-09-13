import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmojiPicker } from "@/components/emoji-picker";
import { useUiStore } from "@/stores/ui-store";
import {
  useCreateRoutine,
  useUpdateRoutine,
} from "@/hooks/use-routines";
import {
  type Routine,
  type TimeOfDay,
} from "@focusflow/validators";
import { TIME_SLOTS } from "./routine-schedule";

/** Create or rename a routine — name, emoji, time slot, days. */

export function RoutineForm({
  initialData,
  onSuccess,
}: {
  initialData: Routine | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const create = useCreateRoutine();
  const update = useUpdateRoutine();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    initialData?.timeOfDay ?? "morning",
  );
  const [days, setDays] = useState<number[]>(initialData?.daysOfWeek ?? []);

  const isPending = create.isPending || update.isPending;

  const toggleDay = (d: number) => {
    setDays((curr) =>
      curr.includes(d) ? curr.filter((x) => x !== d) : [...curr, d].sort(),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;
    if (isEdit) {
      update.mutate(
        {
          id: initialData.id,
          childId: activeChildId,
          name,
          emoji: emoji || null,
          timeOfDay,
          daysOfWeek: days,
        },
        { onSuccess },
      );
    } else {
      create.mutate(
        {
          childId: activeChildId,
          name,
          emoji: emoji || undefined,
          timeOfDay,
          daysOfWeek: days,
          steps: [],
        },
        { onSuccess },
      );
    }
  };

  const dayLabels = [
    t("days.monShort"),
    t("days.tueShort"),
    t("days.wedShort"),
    t("days.thuShort"),
    t("days.friShort"),
    t("days.satShort"),
    t("days.sunShort"),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="routine-name">{t("routines.namePrompt")}</Label>
        <div className="flex gap-2">
          <EmojiPicker
            value={emoji}
            onSelect={setEmoji}
            placeholder="🌞"
          >
            <button
              type="button"
              aria-label={t("routines.chooseEmoji")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{emoji || <span className="opacity-50">🌞</span>}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </EmojiPicker>
          <Input
            id="routine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("routines.namePlaceholder")}
            required
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("routines.timeSlotLabel")}</Label>
        <Select
          value={timeOfDay}
          onValueChange={(v) => v && setTimeOfDay(v as TimeOfDay)}
          items={Object.fromEntries(
            TIME_SLOTS.map((s) => [s.value, t(`routines.timeSlot.${s.value}`)]),
          )}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((s) => {
              const label = t(`routines.timeSlot.${s.value}`);
              return (
                <SelectItem key={s.value} value={s.value} label={label}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("routines.daysLabel")}</Label>
        <p className="text-xs text-muted-foreground">
          {t("routines.daysHint")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {dayLabels.map((label, idx) => {
            const selected = days.includes(idx);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`min-w-[3rem] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || !name || isPending}
      >
        {isPending
          ? t("routines.saving")
          : isEdit
            ? t("routines.save")
            : t("routines.create")}
      </Button>
    </form>
  );
}
