import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Shuffle,
} from "lucide-react";
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
  useCreateBarkleyBehavior,
} from "@/hooks/use-barkley";

/** Add or rename a tracked behaviour. */

export function BehaviorForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const BEHAVIOR_SUGGESTIONS = t("behaviorSuggestions", { returnObjects: true }) as {
    icon: string;
    name: string;
  }[];
  const createBehavior = useCreateBarkleyBehavior();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

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
        <Label htmlFor="beh-name">{t("behaviorTracking.nameLabel")}</Label>
        <InputGroup>
          <EmojiPicker value={icon} onSelect={setIcon} placeholder="🧹" />
          <InputGroupInput
            id="beh-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("behaviorTracking.namePlaceholder")}
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
              <TooltipContent>{t("behaviorTracking.randomSuggestion")}</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          <span>{t("behaviorTracking.popularIdeas")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BEHAVIOR_SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              <span className="text-sm">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!name || createBehavior.isPending}
      >
        {createBehavior.isPending ? t("behaviorTracking.saving") : t("behaviorTracking.add")}
      </Button>
    </form>
  );
}
