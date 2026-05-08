import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePauseBilling } from "@/hooks/use-billing";

type PauseMonths = 1 | 2 | 3;

export function PauseSubscriptionDialog() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const pause = usePauseBilling();
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState<PauseMonths>(1);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleSubmit = () => {
    pause.mutate(months, {
      onSuccess: (data) => {
        toast.success(
          t("account.pauseSuccess", { date: formatDate(data.pausedUntil) }),
        );
        setOpen(false);
      },
      onError: (err: unknown) => {
        // Surface the 409 quota-exceeded error specifically; fall back to a
        // generic message for network / Stripe failures.
        const status = (err as { status?: number } | null)?.status;
        if (status === 409) {
          toast.error(t("account.pauseQuotaExceeded"));
        } else {
          toast.error(t("account.pauseGenericError"));
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PauseCircle className="h-4 w-4" data-icon="inline-start" />
            {t("account.pauseCta")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("account.pauseDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("account.pauseDialogIntro")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {t("account.pauseChooseDuration")}
          </p>
          <RadioGroup<PauseMonths>
            value={months}
            onValueChange={(v) => setMonths(v)}
            aria-label={t("account.pauseChooseDuration")}
            className="grid grid-cols-3 gap-2"
          >
            {([1, 2, 3] as const).map((m) => (
              <RadioGroupItem
                key={m}
                value={m}
                className={
                  "rounded-lg border px-3 py-2 text-center text-sm font-medium " +
                  (months === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground")
                }
              >
                {m === 1
                  ? t("account.pauseOneMonth")
                  : m === 2
                    ? t("account.pauseTwoMonths")
                    : t("account.pauseThreeMonths")}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("child.cancel")}
          </DialogClose>
          <Button onClick={handleSubmit} disabled={pause.isPending}>
            {pause.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
            )}
            {pause.isPending
              ? t("account.pauseSubmitting")
              : t("account.pauseSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
