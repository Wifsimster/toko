import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { AgeRange, Child } from "@focusflow/validators";

type Gender = "male" | "female" | "other";
type DiagnosisType = "inattentive" | "hyperactive" | "mixed" | "undefined";

const AGE_RANGES: AgeRange[] = ["0-5", "6-8", "9-11", "12-14", "15-17"];

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
  const [ageRange, setAgeRange] = useState<AgeRange | "">(initialData?.ageRange ?? "");
  const [gender, setGender] = useState<string>(initialData?.gender ?? "");
  const [diagnosisType, setDiagnosisType] = useState<string>(
    initialData?.diagnosisType ?? "undefined"
  );
  const [consent, setConsent] = useState(false);

  const isPending = createChild.isPending || updateChild.isPending;
  const showAdditionalFields = name.length > 0 || isEdit;
  // Consent to process the child's health data (RGPD Art. 9) is required only
  // when creating a new profile, not when editing an existing one.
  const showConsent = !isEdit && showAdditionalFields;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageRange) return;

    const payload = {
      name,
      ageRange,
      ...(gender && { gender: gender as Gender }),
      diagnosisType: diagnosisType as DiagnosisType,
    };

    if (isEdit && initialData) {
      updateChild.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => onSuccess() }
      );
    } else {
      if (!consent) return;
      createChild.mutate(
        { ...payload, healthDataConsent: true },
        {
          onSuccess: (data) => {
            setActiveChild(data.id);
            onSuccess();
          },
        }
      );
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
              <Shuffle className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t("child.randomNicknameTooltip")}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {showAdditionalFields && (
        <div className="space-y-2">
          <Label htmlFor="child-age-range">{t("child.ageRangeLabel")}</Label>
          <Select
            value={ageRange}
            onValueChange={(v) => v && setAgeRange(v as AgeRange)}
            items={Object.fromEntries(
              AGE_RANGES.map((r) => [r, t(`child.ageRange_${r}`)])
            )}
          >
            <SelectTrigger id="child-age-range">
              <SelectValue placeholder={t("child.ageRangePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map((r) => (
                <SelectItem key={r} value={r} label={t(`child.ageRange_${r}`)}>
                  {t(`child.ageRange_${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("child.diagnosisHelp")}{" "}
                <a
                  href={t("child.diagnosisLearnMoreUrl")}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-foreground"
                >
                  {t("child.diagnosisLearnMore")}
                </a>
              </p>
            </div>
          </div>
        </details>
      )}
      {showConsent && (
        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <Checkbox
            id="child-health-consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="child-health-consent"
            className="text-xs font-normal leading-relaxed text-muted-foreground"
          >
            {t("child.healthConsentLabel")}
          </Label>
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || (showConsent && !consent)}
      >
        {isPending
          ? (isEdit ? t("child.saving") : t("child.adding"))
          : (isEdit ? t("child.save") : t("child.add"))}
      </Button>
    </form>
  );
}
