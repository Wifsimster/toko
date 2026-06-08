import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Flag, Mail, Save, SlidersHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import {
  useUpdateAdminSettings,
  type AdminSettings,
} from "@/hooks/use-admin-settings";
import type { AppSettings } from "@focusflow/validators";
import { ToggleRow } from "./toggle-row";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toFormState(s: AdminSettings): AppSettings {
  return {
    appName: s.appName,
    supportEmail: s.supportEmail,
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
    inAppNotificationsEnabled: s.inAppNotificationsEnabled,
    pushNotificationsEnabled: s.pushNotificationsEnabled,
    reminderNotificationsEnabled: s.reminderNotificationsEnabled,
    emailSenderName: s.emailSenderName,
    emailSenderAddress: s.emailSenderAddress,
    welcomeEmailEnabled: s.welcomeEmailEnabled,
    weeklyDigestEmailEnabled: s.weeklyDigestEmailEnabled,
    featureKoeAssistant: s.featureKoeAssistant,
    featureBurnoutTest: s.featureBurnoutTest,
    featureCommunityScripts: s.featureCommunityScripts,
    featureAiRecommendations: s.featureAiRecommendations,
  };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SettingsForm({ initial }: { initial: AdminSettings }) {
  const { t } = useTranslation();
  const update = useUpdateAdminSettings();
  const baseline = toFormState(initial);
  const [form, setForm] = useState<AppSettings>(baseline);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const appNameError = form.appName.trim().length === 0;
  const supportEmailError = !EMAIL_REGEX.test(form.supportEmail.trim());
  const senderNameError = form.emailSenderName.trim().length === 0;
  const senderEmailError = !EMAIL_REGEX.test(form.emailSenderAddress.trim());
  const hasErrors =
    appNameError || supportEmailError || senderNameError || senderEmailError;

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const handleSave = () => {
    if (hasErrors || !dirty) return;
    const message = form.maintenanceMessage?.trim();
    update.mutate({
      ...form,
      appName: form.appName.trim(),
      supportEmail: form.supportEmail.trim(),
      emailSenderName: form.emailSenderName.trim(),
      emailSenderAddress: form.emailSenderAddress.trim(),
      maintenanceMessage: message ? message : null,
    });
  };

  const disabled = update.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle", {
          date: formatDateTime(initial.updatedAt),
        })}
      />

      {/* Général */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            {t("settings.sections.general")}
          </CardTitle>
          <CardDescription>
            {t("settings.sections.generalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">{t("settings.fields.appName")}</Label>
            <Input
              id="app-name"
              value={form.appName}
              maxLength={60}
              disabled={disabled}
              onChange={(e) => set("appName", e.target.value)}
            />
            {appNameError && (
              <p className="text-xs text-destructive">
                {t("settings.fields.appNameRequired")}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-email">
              {t("settings.fields.supportEmail")}
            </Label>
            <Input
              id="support-email"
              type="email"
              value={form.supportEmail}
              maxLength={160}
              disabled={disabled}
              onChange={(e) => set("supportEmail", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.fields.supportEmailHint")}
            </p>
            {supportEmailError && (
              <p className="text-xs text-destructive">
                {t("settings.fields.emailInvalid")}
              </p>
            )}
          </div>
          <ToggleRow
            id="maintenance-mode"
            label={t("settings.fields.maintenanceMode")}
            description={t("settings.fields.maintenanceModeDescription")}
            checked={form.maintenanceMode}
            disabled={disabled}
            onChange={(checked) => set("maintenanceMode", checked)}
          />
          {form.maintenanceMode && (
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-message">
                {t("settings.fields.maintenanceMessage")}
              </Label>
              <Textarea
                id="maintenance-message"
                value={form.maintenanceMessage ?? ""}
                maxLength={300}
                rows={3}
                disabled={disabled}
                placeholder={t("settings.fields.maintenanceMessagePlaceholder")}
                onChange={(e) => set("maintenanceMessage", e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-muted-foreground" />
            {t("settings.sections.notifications")}
          </CardTitle>
          <CardDescription>
            {t("settings.sections.notificationsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            id="in-app-notifications"
            label={t("settings.fields.inAppNotifications")}
            description={t("settings.fields.inAppNotificationsDescription")}
            checked={form.inAppNotificationsEnabled}
            disabled={disabled}
            onChange={(checked) => set("inAppNotificationsEnabled", checked)}
          />
          <ToggleRow
            id="push-notifications"
            label={t("settings.fields.pushNotifications")}
            description={t("settings.fields.pushNotificationsDescription")}
            checked={form.pushNotificationsEnabled}
            disabled={disabled}
            onChange={(checked) => set("pushNotificationsEnabled", checked)}
          />
          <ToggleRow
            id="reminder-notifications"
            label={t("settings.fields.reminderNotifications")}
            description={t("settings.fields.reminderNotificationsDescription")}
            checked={form.reminderNotificationsEnabled}
            disabled={disabled}
            onChange={(checked) => set("reminderNotificationsEnabled", checked)}
          />
        </CardContent>
      </Card>

      {/* E-mails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4 text-muted-foreground" />
            {t("settings.sections.emails")}
          </CardTitle>
          <CardDescription>
            {t("settings.sections.emailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sender-name">
              {t("settings.fields.senderName")}
            </Label>
            <Input
              id="sender-name"
              value={form.emailSenderName}
              maxLength={60}
              disabled={disabled}
              onChange={(e) => set("emailSenderName", e.target.value)}
            />
            {senderNameError && (
              <p className="text-xs text-destructive">
                {t("settings.fields.senderNameRequired")}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sender-address">
              {t("settings.fields.senderAddress")}
            </Label>
            <Input
              id="sender-address"
              type="email"
              value={form.emailSenderAddress}
              maxLength={160}
              disabled={disabled}
              onChange={(e) => set("emailSenderAddress", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.fields.senderAddressHint")}
            </p>
            {senderEmailError && (
              <p className="text-xs text-destructive">
                {t("settings.fields.emailInvalid")}
              </p>
            )}
          </div>
          <ToggleRow
            id="welcome-email"
            label={t("settings.fields.welcomeEmail")}
            description={t("settings.fields.welcomeEmailDescription")}
            checked={form.welcomeEmailEnabled}
            disabled={disabled}
            onChange={(checked) => set("welcomeEmailEnabled", checked)}
          />
          <ToggleRow
            id="weekly-digest-email"
            label={t("settings.fields.weeklyDigestEmail")}
            description={t("settings.fields.weeklyDigestEmailDescription")}
            checked={form.weeklyDigestEmailEnabled}
            disabled={disabled}
            onChange={(checked) => set("weeklyDigestEmailEnabled", checked)}
          />
        </CardContent>
      </Card>

      {/* Fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="size-4 text-muted-foreground" />
            {t("settings.sections.features")}
          </CardTitle>
          <CardDescription>
            {t("settings.sections.featuresDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            id="feature-koe"
            label={t("settings.fields.featureKoe")}
            description={t("settings.fields.featureKoeDescription")}
            checked={form.featureKoeAssistant}
            disabled={disabled}
            onChange={(checked) => set("featureKoeAssistant", checked)}
          />
          <ToggleRow
            id="feature-burnout"
            label={t("settings.fields.featureBurnout")}
            description={t("settings.fields.featureBurnoutDescription")}
            checked={form.featureBurnoutTest}
            disabled={disabled}
            onChange={(checked) => set("featureBurnoutTest", checked)}
          />
          <ToggleRow
            id="feature-scripts"
            label={t("settings.fields.featureScripts")}
            description={t("settings.fields.featureScriptsDescription")}
            checked={form.featureCommunityScripts}
            disabled={disabled}
            onChange={(checked) => set("featureCommunityScripts", checked)}
          />
          <ToggleRow
            id="feature-ai"
            label={t("settings.fields.featureAi")}
            description={t("settings.fields.featureAiDescription")}
            checked={form.featureAiRecommendations}
            disabled={disabled}
            onChange={(checked) => set("featureAiRecommendations", checked)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {dirty && !hasErrors && (
          <p className="text-sm text-muted-foreground">
            {t("settings.unsavedChanges")}
          </p>
        )}
        {hasErrors && (
          <p className="text-sm text-destructive">
            {t("settings.fixErrors")}
          </p>
        )}
        <Button
          onClick={handleSave}
          disabled={disabled || hasErrors || !dirty}
        >
          <Save className="size-4" aria-hidden="true" />
          {update.isPending ? t("settings.saving") : t("settings.save")}
        </Button>
      </div>
    </div>
  );
}
