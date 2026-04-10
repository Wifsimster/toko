import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";

export function NotificationsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = usePreferences();
  const update = useUpdatePreferences();

  if (isLoading || !data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {t("notifications.title")}
        </CardTitle>
        <CardDescription>{t("notifications.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label
          htmlFor="daily-reminder"
          className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2.5"
        >
          <div className="space-y-0.5">
            <span className="block text-sm font-medium">{t("notifications.dailyReminder")}</span>
            <p className="text-xs text-muted-foreground">
              {t("notifications.dailyReminderBody")}
            </p>
          </div>
          <input
            id="daily-reminder"
            type="checkbox"
            checked={data.dailyReminderOptIn}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({ dailyReminderOptIn: e.target.checked })
            }
            className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
          />
        </label>
        <label
          htmlFor="weekly-digest"
          className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2.5"
        >
          <div className="space-y-0.5">
            <span className="block text-sm font-medium">{t("notifications.weeklyDigest")}</span>
            <p className="text-xs text-muted-foreground">
              {t("notifications.weeklyDigestBody")}
            </p>
          </div>
          <input
            id="weekly-digest"
            type="checkbox"
            checked={data.weeklyDigestOptIn}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({ weeklyDigestOptIn: e.target.checked })
            }
            className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
          />
        </label>
      </CardContent>
    </Card>
  );
}
