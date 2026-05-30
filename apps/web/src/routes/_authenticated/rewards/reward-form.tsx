import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Sparkles, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useCreateBarkleyReward,
  useUpdateBarkleyReward,
} from "@/hooks/use-barkley";
import type { BarkleyReward } from "@focusflow/validators";

export function RewardForm({
  childId,
  reward,
  onSuccess,
}: {
  childId: string;
  reward?: BarkleyReward;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const REWARD_SUGGESTIONS = t("rewardSuggestions", {
    returnObjects: true,
  }) as { icon: string; name: string }[];
  const createReward = useCreateBarkleyReward();
  const updateReward = useUpdateBarkleyReward();
  const isEdit = reward !== undefined;
  const mutation = isEdit ? updateReward : createReward;
  const [name, setName] = useState(reward?.name ?? "");
  const [icon, setIcon] = useState(reward?.icon ?? "");
  const [starsRequired, setStarsRequired] = useState(
    reward?.starsRequired ?? 5
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const safeStar = Number.isFinite(starsRequired) ? starsRequired : 0;
    if (isEdit && reward) {
      updateReward.mutate(
        {
          id: reward.id,
          childId,
          name: name.trim(),
          icon: icon || undefined,
          starsRequired: safeStar,
        },
        {
          onSuccess,
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : t("rewards.updateError")
            );
          },
        }
      );
    } else {
      createReward.mutate(
        {
          childId,
          name: name.trim(),
          starsRequired: safeStar,
          icon: icon || undefined,
        },
        { onSuccess }
      );
    }
  };

  const handlePickSuggestion = (s: { icon: string; name: string }) => {
    setIcon(s.icon);
    setName(s.name);
    setShowSuggestions(false);
  };

  const pickRandom = () => {
    const s =
      REWARD_SUGGESTIONS[
        Math.floor(Math.random() * REWARD_SUGGESTIONS.length)
      ]!;
    setIcon(s.icon);
    setName(s.name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reward-name">{t("rewards.nameLabel")}</Label>
        <InputGroup>
          <EmojiPicker value={icon} onSelect={setIcon} />
          <InputGroupInput
            id="reward-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("rewards.namePlaceholder")}
            required
          />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton onClick={pickRandom}>
                    <Shuffle className="size-3.5" />
                  </InputGroupButton>
                }
              />
              <TooltipContent>{t("rewards.randomSuggestion")}</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reward-stars">{t("rewards.starsNeededLabel")}</Label>
        <Input
          id="reward-stars"
          type="number"
          min={0}
          value={starsRequired}
          onChange={(e) => setStarsRequired(Number(e.target.value))}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t("rewards.starsNeededHelp")}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <Sparkles className="mr-2 size-4" />
        {showSuggestions ? t("rewards.hideIdeas") : t("rewards.showIdeas")}
      </Button>

      {showSuggestions && (
        <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto rounded-lg border p-2">
          {REWARD_SUGGESTIONS.map((s) => (
            <Button
              key={s.name}
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-auto py-2.5"
              onClick={() => handlePickSuggestion(s)}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </Button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!name || mutation.isPending}
      >
        {mutation.isPending
          ? t("rewards.saving")
          : isEdit
            ? t("rewards.save")
            : t("rewards.add")}
      </Button>
    </form>
  );
}
