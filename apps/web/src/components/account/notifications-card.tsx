import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
          <Label
            htmlFor="daily-reminder"
            className="cursor-pointer space-y-0.5"
          >
            <span className="text-sm font-medium">{t("notifications.dailyReminder")}</span>
            <p className="text-xs text-muted-foreground">
              {t("notifications.dailyReminderBody")}
            </p>
          </Label>
          <input
            id="daily-reminder"
            type="checkbox"
            checked={data.dailyReminderOptIn}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({ dailyReminderOptIn: e.target.checked })
            }
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
          <Label
            htmlFor="weekly-digest"
            className="cursor-pointer space-y-0.5"
          >
            <span className="text-sm font-medium">{t("notifications.weeklyDigest")}</span>
            <p className="text-xs text-muted-foreground">
              {t("notifications.weeklyDigestBody")}
            </p>
          </Label>
          <input
            id="weekly-digest"
            type="checkbox"
            checked={data.weeklyDigestOptIn}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({ weeklyDigestOptIn: e.target.checked })
            }
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
}
