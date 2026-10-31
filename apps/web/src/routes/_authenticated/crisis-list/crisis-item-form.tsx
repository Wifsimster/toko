import { useState } from "react";

import { useTranslation } from "react-i18next";

import {
  Sparkles,
  Shuffle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconPicker,
  IconPickerValue,
  CRISIS_ICON_KEYS,
} from "@/components/icon-picker";
import { ItemIcon } from "@/components/shared/item-icon";
import { storedValueForIcon } from "@/lib/item-icons";
import {
  useCreateCrisisItem,
  useUpdateCrisisItem,
} from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";

export function CrisisItemForm({
  initialData,
  onSuccess,
}: {
  initialData: CrisisItem | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const SUGGESTIONS = t("crisisSuggestions", { returnObjects: true }) as {
    emoji: string;
    label: string;
  }[];
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createItem = useCreateCrisisItem();
  const updateItem = useUpdateCrisisItem();
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");

  const isEdit = !!initialData;
  const isPending = createItem.isPending || updateItem.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    if (isEdit) {
      updateItem.mutate(
        {
          id: initialData.id,
          childId: activeChildId,
          label,
          emoji: emoji || undefined,
        },
        { onSuccess }
      );
    } else {
      createItem.mutate(
        {
          childId: activeChildId,
          label,
          emoji: emoji || undefined,
        },
        { onSuccess }
      );
    }
  };

  const handlePickSuggestion = (suggestion: { emoji: string; label: string }) => {
    setEmoji(storedValueForIcon(suggestion.emoji));
    setLabel(suggestion.label);
  };

  const pickRandom = () => {
    const s = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]!;
    setEmoji(storedValueForIcon(s.emoji));
    setLabel(s.label);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crisis-label">
          {isEdit ? t("crisis.editActivity") : t("crisis.labelPrompt")}
        </Label>
        <div className="flex gap-2">
          <IconPicker
            value={emoji}
            onSelect={setEmoji}
            keys={CRISIS_ICON_KEYS}
            columns={5}
            placeholder="smile"
          >
            <button
              type="button"
              aria-label={t("crisis.chooseIcon")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconPickerValue value={emoji} placeholder="smile" className="size-6" />
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </IconPicker>
          <div className="flex flex-1 gap-1">
            <Input
              id="crisis-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("crisis.labelPlaceholder")}
              required
            />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={pickRandom}
                  >
                    <Shuffle className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>{t("crisis.randomSuggestion")}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          <span>{t("crisis.popularIdeas")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              <ItemIcon value={s.emoji} className="size-4" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || !label || isPending}
      >
        {isPending
          ? t("crisis.saving")
          : isEdit
            ? t("crisis.save")
            : t("crisis.addToList")}
      </Button>
    </form>
  );
}
