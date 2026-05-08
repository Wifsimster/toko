import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryConfig } from "@/components/strengths/strength-card";
import {
  useCreateStrength,
  useUpdateStrength,
} from "@/hooks/use-strengths";
import { useUiStore } from "@/stores/ui-store";
import type { Strength, StrengthCategory } from "@focusflow/validators";

const CATEGORIES: StrengthCategory[] = [
  "talent",
  "achievement",
  "quality",
  "progress",
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StrengthForm({
  initialData,
  onSuccess,
}: {
  initialData: Strength | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createStrength = useCreateStrength();
  const updateStrength = useUpdateStrength();

  const [category, setCategory] = useState<StrengthCategory>(
    initialData?.category ?? "talent"
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");
  const [occurredOn, setOccurredOn] = useState(
    initialData?.occurredOn ?? todayIso()
  );

  const isEdit = !!initialData;
  const isPending = createStrength.isPending || updateStrength.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !title.trim()) return;

    const payload = {
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      emoji: emoji.trim() || undefined,
      occurredOn,
    };

    if (isEdit) {
      updateStrength.mutate(
        { id: initialData.id, childId: activeChildId, ...payload },
        {
          onSuccess: () => {
            toast.success(t("strengths.savedToast"));
            onSuccess();
          },
        }
      );
    } else {
      createStrength.mutate(
        { childId: activeChildId, ...payload },
        {
          onSuccess: () => {
            toast.success(t("strengths.addedToast"));
            onSuccess();
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? t("strengths.editTitle") : t("strengths.newTitle")}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="strength-category">
          {t("strengths.fields.category")}
        </Label>
        <Select
          value={category}
          onValueChange={(v) => v && setCategory(v as StrengthCategory)}
          items={Object.fromEntries(
            CATEGORIES.map((c) => [c, t(categoryConfig[c].labelKey)])
          )}
        >
          <SelectTrigger id="strength-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c}
                value={c}
                label={t(categoryConfig[c].labelKey)}
              >
                <span className="mr-2" aria-hidden="true">
                  {categoryConfig[c].fallbackEmoji}
                </span>
                {t(categoryConfig[c].labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <div className="space-y-2">
          <Label htmlFor="strength-emoji">{t("strengths.fields.emoji")}</Label>
          <Input
            id="strength-emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder={categoryConfig[category].fallbackEmoji}
            maxLength={16}
            className="text-center text-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="strength-title">
            {t("strengths.fields.title")}
            <span className="text-destructive" aria-hidden="true">
              {" *"}
            </span>
          </Label>
          <Input
            id="strength-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("strengths.fields.titlePlaceholder")}
            maxLength={200}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="strength-description">
          {t("strengths.fields.description")}
        </Label>
        <Textarea
          id="strength-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("strengths.fields.descriptionPlaceholder")}
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strength-date">{t("strengths.fields.occurredOn")}</Label>
        <Input
          id="strength-date"
          type="date"
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
          required
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          {t("strengths.cancel")}
        </DialogClose>
        <Button
          type="submit"
          disabled={!activeChildId || !title.trim() || isPending}
        >
          {isPending
            ? t("strengths.saving")
            : isEdit
              ? t("strengths.save")
              : t("strengths.add")}
        </Button>
      </DialogFooter>
    </form>
  );
}
