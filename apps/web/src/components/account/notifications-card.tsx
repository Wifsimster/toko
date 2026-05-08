import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function NotificationsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = usePreferences();
  const update = useUpdatePreferences();

  const [morningTime, setMorningTime] = useState("09:00");
  const [eveningTime, setEveningTime] = useState("20:30");

  useEffect(() => {
    if (data) {
      setMorningTime(data.morningReminderTime);
      setEveningTime(data.eveningReminderTime);
    }
  }, [data]);

  if (isLoading || !data) return null;

  const commitMorningTime = () => {
    if (!TIME_REGEX.test(morningTime) || morningTime === data.morningReminderTime) {
      setMorningTime(data.morningReminderTime);
      return;
    }
    update.mutate({ morningReminderTime: morningTime });
  };

  const commitEveningTime = () => {
    if (!TIME_REGEX.test(eveningTime) || eveningTime === data.eveningReminderTime) {
      setEveningTime(data.eveningReminderTime);
      return;
    }
    update.mutate({ eveningReminderTime: eveningTime });
  };

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
        <div className="rounded-lg border border-border/60 px-3 py-2.5">
          <label
            htmlFor="morning-reminder"
            className="flex min-h-10 cursor-pointer items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <span className="block text-sm font-medium">
                {t("notifications.morningReminder")}
              </span>
              <p className="text-xs text-muted-foreground">
                {t("notifications.morningReminderBody")}
              </p>
            </div>
            <Checkbox
              id="morning-reminder"
              className="h-5 w-5"
              checked={data.dailyReminderOptIn}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({ dailyReminderOptIn: checked === true })
              }
            />
          </label>
          {data.dailyReminderOptIn && (
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border/40 pt-2.5">
              <label
                htmlFor="morning-reminder-time"
                className="text-xs text-muted-foreground"
              >
                {t("notifications.morningReminderTime")}
              </label>
              <Input
                id="morning-reminder-time"
                type="time"
                className="h-9 w-28"
                value={morningTime}
                disabled={update.isPending}
                onChange={(e) => setMorningTime(e.target.value)}
                onBlur={commitMorningTime}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 px-3 py-2.5">
          <label
            htmlFor="evening-reminder"
            className="flex min-h-10 cursor-pointer items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <span className="block text-sm font-medium">
                {t("notifications.eveningReminder")}
              </span>
              <p className="text-xs text-muted-foreground">
                {t("notifications.eveningReminderBody")}
              </p>
            </div>
            <Checkbox
              id="evening-reminder"
              className="h-5 w-5"
              checked={data.eveningReminderOptIn}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({ eveningReminderOptIn: checked === true })
              }
            />
          </label>
          {data.eveningReminderOptIn && (
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border/40 pt-2.5">
              <label
                htmlFor="evening-reminder-time"
                className="text-xs text-muted-foreground"
              >
                {t("notifications.eveningReminderTime")}
              </label>
              <Input
                id="evening-reminder-time"
                type="time"
                className="h-9 w-28"
                value={eveningTime}
                disabled={update.isPending}
                onChange={(e) => setEveningTime(e.target.value)}
                onBlur={commitEveningTime}
              />
            </div>
          )}
        </div>

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
          <Checkbox
            id="weekly-digest"
            className="h-5 w-5"
            checked={data.weeklyDigestOptIn}
            disabled={update.isPending}
            onCheckedChange={(checked) =>
              update.mutate({ weeklyDigestOptIn: checked === true })
            }
          />
        </label>
        <label
          htmlFor="co-parent-activity"
          className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2.5"
        >
          <div className="space-y-0.5">
            <span className="block text-sm font-medium">
              {t("notifications.coParentActivity")}
            </span>
            <p className="text-xs text-muted-foreground">
              {t("notifications.coParentActivityBody")}
            </p>
          </div>
          <Checkbox
            id="co-parent-activity"
            className="h-5 w-5"
            checked={data.coParentActivityOptIn}
            disabled={update.isPending}
            onCheckedChange={(checked) =>
              update.mutate({ coParentActivityOptIn: checked === true })
            }
          />
        </label>
      </CardContent>
    </Card>
  );
}
