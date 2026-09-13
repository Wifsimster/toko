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
import { EmojiPicker, CRISIS_EMOJIS } from "@/components/emoji-picker";
import {
  useCreateCrisisItem,
  useUpdateCrisisItem,
} from "@/hooks/use-crisis-list";
import { useUiStore } from "@/stores/ui-store";
import type { CrisisItem } from "@focusflow/validators";

/** Add or rename a strategy: emoji, label, nothing else. */

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
    setEmoji(suggestion.emoji);
    setLabel(suggestion.label);
  };

  const pickRandom = () => {
    const s = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]!;
    setEmoji(s.emoji);
    setLabel(s.label);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crisis-label">
          {isEdit ? t("crisis.editActivity") : t("crisis.labelPrompt")}
        </Label>
        <div className="flex gap-2">
          <EmojiPicker
            value={emoji}
            onSelect={setEmoji}
            emojis={CRISIS_EMOJIS}
            columns={5}
            placeholder="😊"
          >
            <button
              type="button"
              aria-label={t("crisis.chooseEmoji")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{emoji || <span className="opacity-50">😊</span>}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </EmojiPicker>
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
              <span className="text-sm">{s.emoji}</span>
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
