import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
  Download,
  Trash2,
  Shield,
  Loader2,
  CreditCard,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAccount, useExportAccount } from "@/hooks/use-account";
import {
  useBillingStatus,
  useCancelBilling,
  useCheckout,
  usePortal,
  useResumeBilling,
} from "@/hooks/use-billing";
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
import { NotificationsCard } from "@/components/account/notifications-card";
import { PauseSubscriptionDialog } from "@/components/account/pause-subscription-dialog";
import { SolidarityCard } from "@/components/account/solidarity-card";
import { ThemeCard } from "@/components/account/theme-card";
import { TrialEndingBanner } from "@/components/account/trial-ending-banner";

export const Route = createFileRoute("/_authenticated/account/")({
  component: AccountPage,
  staticData: { crumb: "nav.account" },
});

function AccountPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const session = useSession();
  const deleteAccount = useDeleteAccount();
  const exportAccount = useExportAccount();
  const billing = useBillingStatus();
  const checkout = useCheckout();
  const portal = usePortal();
  const resume = useResumeBilling();
  const cancel = useCancelBilling();
  const [confirmation, setConfirmation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteAccount.mutate();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {t("account.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("account.subtitle")}</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("account.personalInfo")}
          </CardTitle>
          <CardDescription>{t("account.personalInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("account.nameLabel")}</span>
            <span>{session.data?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("account.emailLabel")}</span>
            <span>{session.data?.user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <ThemeCard />

      <NotificationsCard />

      <TrialEndingBanner />

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
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
                  <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                )}
                {t("account.upgradeToFamily")}
              </Button>
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
                    <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
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
                        className="h-4 w-4 animate-spin"
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
                                className="h-4 w-4 animate-spin"
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
                                    ? formatDate(
                                        billing.data.currentPeriodEnd
                                      )
                                    : "",
                                })
                              : t("account.cancelConfirmActive", {
                                  date: billing.data.currentPeriodEnd
                                    ? formatDate(
                                        billing.data.currentPeriodEnd
                                      )
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
                  <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                )}
                {t("account.resubscribe")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/*
        Tarif solidaire — shown only when the parent is not on an active
        Family plan. We don't surface it to active subscribers to avoid
        suggesting they could downgrade themselves into a hardship rate.
      */}
      {!billing.data?.active && <SolidarityCard />}

      {/* Medical report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("account.medicalReport")}
          </CardTitle>
          <CardDescription>
            {t("account.medicalReportDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/report">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" data-icon="inline-start" />
              {t("account.generateReport")}
              <ArrowRight className="h-4 w-4" data-icon="inline-end" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Data export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t("account.exportData")}
          </CardTitle>
          <CardDescription>{t("account.exportDataDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => exportAccount.mutate()}
            disabled={exportAccount.isPending}
          >
            {exportAccount.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Download className="h-4 w-4" data-icon="inline-start" />
            )}
            {exportAccount.isPending
              ? t("account.downloading")
              : t("account.downloadData")}
          </Button>
          {exportAccount.isSuccess && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("account.exportSuccess")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account deletion */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            {t("account.deleteAccount")}
          </CardTitle>
          <CardDescription>{t("account.deleteAccountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" data-icon="inline-start" />
                  {t("account.deleteAccount")}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("account.confirmDeletion")}</DialogTitle>
                <DialogDescription>
                  {t("account.confirmDeletionDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  <Trans
                    i18nKey="account.typeDeleteToConfirm"
                    components={{ 0: <strong /> }}
                  />
                </Label>
                <Input
                  id="delete-confirmation"
                  value={confirmation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmation(e.target.value)
                  }
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline" />}
                >
                  {t("child.cancel")}
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={
                    confirmation !== "DELETE" || deleteAccount.isPending
                  }
                >
                  {deleteAccount.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <Trash2 className="h-4 w-4" data-icon="inline-start" />
                  )}
                  {t("account.deletePermanently")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
