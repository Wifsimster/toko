import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateChild, useUpdateChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import type { Child } from "@focusflow/validators";

type Gender = "male" | "female" | "other";
type DiagnosisType = "inattentive" | "hyperactive" | "mixed" | "undefined";

export function ChildForm({
  initialData,
  onSuccess,
}: {
  initialData?: Child | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const setActiveChild = useUiStore((s) => s.setActiveChild);

  const randomFirstnames = t("randomFirstnames", { returnObjects: true }) as string[];
  const getRandomFirstname = () =>
    randomFirstnames[Math.floor(Math.random() * randomFirstnames.length)]!;

  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? "");
  const [gender, setGender] = useState<string>(initialData?.gender ?? "");
  const [diagnosisType, setDiagnosisType] = useState<string>(
    initialData?.diagnosisType ?? "undefined"
  );

  const isPending = createChild.isPending || updateChild.isPending;
  const showAdditionalFields = name.length > 0 || isEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      birthDate,
      ...(gender && { gender: gender as Gender }),
      diagnosisType: diagnosisType as DiagnosisType,
    };

    if (isEdit && initialData) {
      updateChild.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => onSuccess() }
      );
    } else {
      createChild.mutate(payload, {
        onSuccess: (data) => {
          setActiveChild(data.id);
          onSuccess();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="child-name">{t("child.firstnameLabel")}</Label>
        <div className="flex gap-2">
          <Input
            id="child-name"
            placeholder={t("child.firstnamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={t("child.randomNicknameTooltip")}
                  onClick={() => setName(getRandomFirstname())}
                />
              }
            >
              <Shuffle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t("child.randomNicknameTooltip")}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {showAdditionalFields && (
        <div className="space-y-2">
          <Label htmlFor="child-birth">{t("child.birthDateLabel")}</Label>
          <Input
            id="child-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
      )}
      {showAdditionalFields && (
        <details className="group rounded-lg border border-border/60" open={isEdit}>
          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="transition-transform group-open:rotate-90">›</span>
              {t("child.optionalDetails")}
            </span>
          </summary>
          <div className="space-y-4 px-3 pb-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="child-gender">{t("child.genderLabel")}</Label>
              <Select
                value={gender}
                onValueChange={(v) => v && setGender(v)}
                items={{
                  male: t("child.genderMale"),
                  female: t("child.genderFemale"),
                  other: t("child.genderOther"),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("child.genderNotSet")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male" label={t("child.genderMale")}>
                    {t("child.genderMale")}
                  </SelectItem>
                  <SelectItem value="female" label={t("child.genderFemale")}>
                    {t("child.genderFemale")}
                  </SelectItem>
                  <SelectItem value="other" label={t("child.genderOther")}>
                    {t("child.genderOther")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-diagnosis">{t("child.diagnosisLabel")}</Label>
              <Select
                value={diagnosisType}
                onValueChange={(v) => v && setDiagnosisType(v)}
                items={{
                  undefined: t("child.diagnosisUndefined"),
                  inattentive: t("child.diagnosisInattentive"),
                  hyperactive: t("child.diagnosisHyperactive"),
                  mixed: t("child.diagnosisMixed"),
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined" label={t("child.diagnosisUndefined")}>
                    {t("child.diagnosisUndefined")}
                  </SelectItem>
                  <SelectItem value="inattentive" label={t("child.diagnosisInattentive")}>
                    {t("child.diagnosisInattentive")}
                  </SelectItem>
                  <SelectItem value="hyperactive" label={t("child.diagnosisHyperactive")}>
                    {t("child.diagnosisHyperactive")}
                  </SelectItem>
                  <SelectItem value="mixed" label={t("child.diagnosisMixed")}>
                    {t("child.diagnosisMixed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </details>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending
          ? (isEdit ? t("child.saving") : t("child.adding"))
          : (isEdit ? t("child.save") : t("child.add"))}
      </Button>
    </form>
  );
}
