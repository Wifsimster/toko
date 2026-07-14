import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";

// Reminders default to OFF (opt-in, RGPD). This dashboard prompt re-offers the
// evening reminder — the retention loop the product depends on — where the
// parent actually is, once, and only while it's disabled. Dismissible for the
// session; it disappears for good as soon as it's enabled.
export function EveningReminderPrompt() {
  const { t } = useTranslation();
  const { data: prefs } = usePreferences();
  const update = useUpdatePreferences();
  const [dismissed, setDismissed] = useState(false);

  // Only show when we know reminders are off. Hidden while loading, once
  // enabled, or after a manual dismiss.
  if (dismissed || !prefs || prefs.eveningReminderOptIn) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-4" />
          </div>
          <div>
            <p className="font-medium">{t("eveningReminderPrompt.title")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("eveningReminderPrompt.body")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <Button
            onClick={() => update.mutate({ eveningReminderOptIn: true })}
            disabled={update.isPending}
          >
            {update.isPending
              ? t("eveningReminderPrompt.enabling")
              : t("eveningReminderPrompt.enable")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("eveningReminderPrompt.dismiss")}
            onClick={() => setDismissed(true)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
