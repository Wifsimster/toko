import { useTranslation } from "react-i18next";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PauseSubscriptionDialog } from "@/components/account/pause-subscription-dialog";
import {
  useBillingStatus,
  useCancelBilling,
  useCheckout,
  usePortal,
  useResumeBilling,
} from "@/hooks/use-billing";

export function BillingCard({
  formatDate,
}: {
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const billing = useBillingStatus();
  const checkout = useCheckout();
  const portal = usePortal();
  const resume = useResumeBilling();
  const cancel = useCancelBilling();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" />
          {t("account.subscription")}
        </CardTitle>
        <CardDescription>{t("account.subscriptionDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {billing.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : !billing.data || billing.data.status === "none" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("account.usingFreePlan")}
            </p>
            <Button
              onClick={() => checkout.mutate()}
              disabled={checkout.isPending}
            >
              {checkout.isPending && (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              )}
              {t("account.upgradeToFamily")}
            </Button>
          </div>
        ) : billing.data.status === "granted" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">{t("account.complimentary")}</Badge>
              <span className="text-sm font-medium">
                {t("account.familyPlan")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("account.complimentaryHint")}
            </p>
          </div>
        ) : billing.data.active ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  billing.data.paused
                    ? "secondary"
                    : billing.data.cancelAtPeriodEnd
                    ? "secondary"
                    : billing.data.status === "trialing"
                    ? "secondary"
                    : "default"
                }
              >
                {billing.data.paused
                  ? t("account.paused")
                  : billing.data.cancelAtPeriodEnd
                  ? t("account.cancelScheduled")
                  : billing.data.status === "trialing"
                  ? t("account.trial")
                  : t("account.active")}
              </Badge>
              <span className="text-sm font-medium">
                {t("account.familyPlan")}
                {billing.data.interval === "year"
                  ? ` — ${t("account.intervalAnnual")}`
                  : billing.data.interval === "month"
                  ? ` — ${t("account.intervalMonthly")}`
                  : ""}
              </span>
            </div>
            {billing.data.paused && billing.data.pausedUntil ? (
              <p className="text-sm text-muted-foreground">
                {t("account.pausedUntil")} {formatDate(billing.data.pausedUntil)}
              </p>
            ) : billing.data.cancelAtPeriodEnd && billing.data.currentPeriodEnd ? (
              <p className="text-sm text-muted-foreground">
                {t("account.cancelScheduledHint", {
                  date: formatDate(billing.data.currentPeriodEnd),
                })}
              </p>
            ) : (
              billing.data.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {billing.data.status === "trialing"
                    ? t("account.trialEnd")
                    : t("account.nextRenewal")}
                  {" : "}
                  {formatDate(billing.data.currentPeriodEnd)}
                </p>
              )
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                {portal.isPending && (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                )}
                {t("account.manageSubscription")}
              </Button>
              {billing.data.paused || billing.data.cancelAtPeriodEnd ? (
                <Button
                  onClick={() => resume.mutate()}
                  disabled={resume.isPending}
                >
                  {resume.isPending && (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  )}
                  {billing.data.cancelAtPeriodEnd && !billing.data.paused
                    ? t("account.reactivateCta")
                    : t("account.resumeCta")}
                </Button>
              ) : (
                <>
                  <PauseSubscriptionDialog />
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={cancel.isPending}
                        >
                          {cancel.isPending && (
                            <Loader2
                              className="size-4 animate-spin"
                              data-icon="inline-start"
                            />
                          )}
                          {t("account.cancelCta")}
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("account.cancelConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {billing.data.status === "trialing"
                            ? t("account.cancelConfirmTrial", {
                                date: billing.data.currentPeriodEnd
                                  ? formatDate(billing.data.currentPeriodEnd)
                                  : "",
                              })
                            : t("account.cancelConfirmActive", {
                                date: billing.data.currentPeriodEnd
                                  ? formatDate(billing.data.currentPeriodEnd)
                                  : "",
                              })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("account.cancelKeep")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => cancel.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("account.cancelConfirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {billing.data.status === "past_due"
                  ? t("account.pastDue")
                  : t("account.canceled")}
              </Badge>
              <span className="text-sm font-medium">{t("account.familyPlan")}</span>
            </div>
            {billing.data.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                {t("account.accessUntil")} {formatDate(billing.data.currentPeriodEnd)}
              </p>
            )}
            <Button
              onClick={() => checkout.mutate()}
              disabled={checkout.isPending}
            >
              {checkout.isPending && (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              )}
              {t("account.resubscribe")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
