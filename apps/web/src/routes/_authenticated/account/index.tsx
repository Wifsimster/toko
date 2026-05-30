import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
  Download,
  Trash2,
  Shield,
  Loader2,
  FileText,
  ArrowRight,
  BadgeCheck,
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
import { useDeleteAccount, useExportAccount } from "@/hooks/use-account";
import { useBillingStatus } from "@/hooks/use-billing";
import { EmailVerificationCallout } from "@/components/account/email-verification-callout";
import { NotificationsCard } from "@/components/account/notifications-card";
import { SecurityCard } from "@/components/account/security-card";
import { BillingCard } from "@/components/account/billing-card";
import { SolidarityCard } from "@/components/account/solidarity-card";
import { ThemeCard } from "@/components/account/theme-card";
import { TrialEndingBanner } from "@/components/account/trial-ending-banner";
import { FamilyShareCard } from "@/components/co-parent/family-share-card";

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {t("account.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("account.subtitle")}</p>
      </div>

      {/* Pairable settings — single column on mobile, two on lg+. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4" />
              {t("account.personalInfo")}
            </CardTitle>
            <CardDescription>{t("account.personalInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("account.nameLabel")}</span>
              <span className="text-right">{session.data?.user?.name}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">{t("account.emailLabel")}</span>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="break-all">{session.data?.user?.email}</span>
                {session.data?.user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success-foreground">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    {t("account.emailVerified")}
                  </span>
                )}
              </div>
            </div>
            <EmailVerificationCallout />
          </CardContent>
        </Card>

        <ThemeCard />

        <SecurityCard />

        <NotificationsCard />
      </div>

      <FamilyShareCard />

      <TrialEndingBanner />

      <BillingCard formatDate={formatDate} />

      {/*
        Tarif solidaire — shown only when the parent is not on an active
        Family plan. We don't surface it to active subscribers to avoid
        suggesting they could downgrade themselves into a hardship rate.
      */}
      {!billing.data?.active && <SolidarityCard />}

      {/* Documents & exports — paired on lg+. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Medical report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" />
              {t("account.medicalReport")}
            </CardTitle>
            <CardDescription>
              {t("account.medicalReportDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/report">
              <Button variant="outline" className="gap-2">
                <FileText className="size-4" data-icon="inline-start" />
                {t("account.generateReport")}
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Data export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="size-4" />
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
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Download className="size-4" data-icon="inline-start" />
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
      </div>

      {/* Account deletion */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            {t("account.deleteAccount")}
          </CardTitle>
          <CardDescription>{t("account.deleteAccountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Trash2 className="size-4" data-icon="inline-start" />
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
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <Trash2 className="size-4" data-icon="inline-start" />
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
