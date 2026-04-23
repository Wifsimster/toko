import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import {
  Download,
  Trash2,
  Shield,
  Loader2,
  CreditCard,
  FileText,
  ArrowRight,
  PauseCircle,
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
  useCheckout,
  usePauseBilling,
  usePortal,
} from "@/hooks/use-billing";
import { NotificationsCard } from "@/components/account/notifications-card";

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

      <NotificationsCard />

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
                <Badge variant={billing.data.status === "trialing" ? "secondary" : "default"}>
                  {billing.data.status === "trialing" ? t("account.trial") : t("account.active")}
                </Badge>
                <span className="text-sm font-medium">{t("account.familyPlan")}</span>
              </div>
              {billing.data.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {billing.data.status === "trialing"
                    ? t("account.trialEnd")
                    : t("account.nextRenewal")}
                  {" : "}
                  {formatDate(billing.data.currentPeriodEnd)}
                </p>
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
                <PauseSubscriptionDialog />
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

      {/* Medical report (premium) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("account.medicalReport")}
          </CardTitle>
          <CardDescription>
            {t("account.medicalReportDescription")}
            {!billing.data?.active && t("account.medicalReportFamilyOnly")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/report">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" data-icon="inline-start" />
              {billing.data?.active
                ? t("account.generateReport")
                : t("account.discoverFeature")}
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

function PauseSubscriptionDialog() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const pause = usePauseBilling();
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState<1 | 2 | 3>(1);

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
          t("account.pauseSuccess", { date: formatDate(data.pausedUntil) })
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
          <div
            role="radiogroup"
            aria-label={t("account.pauseChooseDuration")}
            className="grid grid-cols-3 gap-2"
          >
            {([1, 2, 3] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={months === m}
                onClick={() => setMonths(m)}
                className={
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
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
              </button>
            ))}
          </div>
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
