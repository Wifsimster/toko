import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Loader2, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
        // Map each documented 409 `code` to specific copy. Falling back
        // to the generic quota message on any 409 (the previous behaviour)
        // misled parents who hit pause-while-trialing or pause-while-
        // cancel-pending into thinking their annual quota was exhausted.
        const e = err as { status?: number; code?: string } | null;
        if (e?.status === 409) {
          switch (e.code) {
            case "PAUSE_TRIALING":
              toast.error(t("account.pauseTrialingError"));
              return;
            case "PAUSE_CANCEL_PENDING":
              toast.error(t("account.pauseCancelPendingError"));
              return;
            case "PAUSE_ALREADY_PAUSED":
              toast.error(t("account.pauseAlreadyPausedError"));
              return;
            case "PAUSE_QUOTA_EXCEEDED":
            default:
              toast.error(t("account.pauseQuotaExceeded"));
              return;
          }
        }
        toast.error(t("account.pauseGenericError"));
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
                // Selection styling is driven by base-ui's `data-checked`
                // attribute (same pattern as Checkbox in components/ui/) so
                // we don't have to keep the JSX `months === m` flag in
                // sync with the source of truth. `border-2` is constant
                // across both states to avoid a 1px layout shift when the
                // selection moves. The primary-coloured focus-visible ring
                // overrides the wrapper's neutral `ring-ring` for the
                // dialog context.
                className={cn(
                  "relative flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-center text-sm font-medium transition-colors",
                  "border-border/60 text-muted-foreground hover:text-foreground",
                  "data-[checked]:border-primary data-[checked]:bg-primary/10 data-[checked]:text-primary",
                  "focus-visible:ring-primary focus-visible:ring-offset-background",
                )}
              >
                <Check
                  className="size-4 opacity-0 transition-opacity data-[checked]:opacity-100 [[data-checked]_&]:opacity-100"
                  aria-hidden
                />
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
