import { useState } from "react";
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
        title="Paramètres de l'application"
        description={`Configuration réservée aux administrateurs · dernière modification le ${formatDateTime(
          initial.updatedAt,
        )}`}
      />

      {/* Général */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Général
          </CardTitle>
          <CardDescription>
            Identité de l'application et mode maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">Nom de l'application</Label>
            <Input
              id="app-name"
              value={form.appName}
              maxLength={60}
              disabled={disabled}
              onChange={(e) => set("appName", e.target.value)}
            />
            {appNameError && (
              <p className="text-xs text-destructive">
                Le nom de l'application est requis.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-email">E-mail de support</Label>
            <Input
              id="support-email"
              type="email"
              value={form.supportEmail}
              maxLength={160}
              disabled={disabled}
              onChange={(e) => set("supportEmail", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Adresse affichée aux parents pour toute demande d'aide.
            </p>
            {supportEmailError && (
              <p className="text-xs text-destructive">
                Saisissez une adresse e-mail valide.
              </p>
            )}
          </div>
          <ToggleRow
            id="maintenance-mode"
            label="Mode maintenance"
            description="Prévient les parents qu'une intervention technique est en cours."
            checked={form.maintenanceMode}
            disabled={disabled}
            onChange={(checked) => set("maintenanceMode", checked)}
          />
          {form.maintenanceMode && (
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-message">
                Message de maintenance
              </Label>
              <Textarea
                id="maintenance-message"
                value={form.maintenanceMessage ?? ""}
                maxLength={300}
                rows={3}
                disabled={disabled}
                placeholder="Ex. : Tokō revient dans quelques minutes, merci de votre patience."
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
            Notifications
          </CardTitle>
          <CardDescription>
            Canaux de notification disponibles pour l'ensemble des parents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            id="in-app-notifications"
            label="Notifications dans l'application"
            description="Affiche les rappels et messages directement dans Tokō."
            checked={form.inAppNotificationsEnabled}
            disabled={disabled}
            onChange={(checked) => set("inAppNotificationsEnabled", checked)}
          />
          <ToggleRow
            id="push-notifications"
            label="Notifications push"
            description="Autorise l'envoi de notifications sur l'appareil des parents."
            checked={form.pushNotificationsEnabled}
            disabled={disabled}
            onChange={(checked) => set("pushNotificationsEnabled", checked)}
          />
          <ToggleRow
            id="reminder-notifications"
            label="Rappels quotidiens"
            description="Active les rappels de saisie du matin et du soir."
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
            E-mails
          </CardTitle>
          <CardDescription>
            Expéditeur des e-mails et catégories d'envoi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sender-name">Nom de l'expéditeur</Label>
            <Input
              id="sender-name"
              value={form.emailSenderName}
              maxLength={60}
              disabled={disabled}
              onChange={(e) => set("emailSenderName", e.target.value)}
            />
            {senderNameError && (
              <p className="text-xs text-destructive">
                Le nom de l'expéditeur est requis.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sender-address">Adresse de l'expéditeur</Label>
            <Input
              id="sender-address"
              type="email"
              value={form.emailSenderAddress}
              maxLength={160}
              disabled={disabled}
              onChange={(e) => set("emailSenderAddress", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Adresse utilisée comme expéditeur des e-mails transactionnels.
            </p>
            {senderEmailError && (
              <p className="text-xs text-destructive">
                Saisissez une adresse e-mail valide.
              </p>
            )}
          </div>
          <ToggleRow
            id="welcome-email"
            label="E-mail de bienvenue"
            description="Envoyé à chaque parent juste après la création du compte."
            checked={form.welcomeEmailEnabled}
            disabled={disabled}
            onChange={(checked) => set("welcomeEmailEnabled", checked)}
          />
          <ToggleRow
            id="weekly-digest-email"
            label="Récapitulatif hebdomadaire"
            description="Envoie chaque semaine un résumé de l'activité aux parents."
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
            Fonctionnalités
          </CardTitle>
          <CardDescription>
            Active ou désactive certaines fonctionnalités pour tous les
            parents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            id="feature-koe"
            label="Assistant Koe"
            description="Affiche la bulle d'aide Koe dans l'application."
            checked={form.featureKoeAssistant}
            disabled={disabled}
            onChange={(checked) => set("featureKoeAssistant", checked)}
          />
          <ToggleRow
            id="feature-burnout"
            label="Test de burn-out parental"
            description="Donne accès au test de burn-out depuis la section Soins."
            checked={form.featureBurnoutTest}
            disabled={disabled}
            onChange={(checked) => set("featureBurnoutTest", checked)}
          />
          <ToggleRow
            id="feature-scripts"
            label="Scripts de communication"
            description="Donne accès aux scripts de communication prêts à l'emploi."
            checked={form.featureCommunityScripts}
            disabled={disabled}
            onChange={(checked) => set("featureCommunityScripts", checked)}
          />
          <ToggleRow
            id="feature-ai"
            label="Recommandations IA"
            description="Affiche les recommandations personnalisées générées par l'IA."
            checked={form.featureAiRecommendations}
            disabled={disabled}
            onChange={(checked) => set("featureAiRecommendations", checked)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {dirty && !hasErrors && (
          <p className="text-sm text-muted-foreground">
            Modifications non enregistrées.
          </p>
        )}
        {hasErrors && (
          <p className="text-sm text-destructive">
            Corrigez les champs en rouge avant d'enregistrer.
          </p>
        )}
        <Button
          onClick={handleSave}
          disabled={disabled || hasErrors || !dirty}
        >
          <Save className="size-4" aria-hidden="true" />
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
