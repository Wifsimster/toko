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
import { usePush } from "@/hooks/use-push";
import { useBillingStatus } from "@/hooks/use-billing";
import { Button } from "@/components/ui/button";
import { reconcilePushSubscription, type PushEnableResult } from "@/lib/push";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function NotificationsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = usePreferences();
  const update = useUpdatePreferences();
  const push = usePush();
  const { data: billing } = useBillingStatus();
  const [formationPush, setFormationPush] = useState<PushEnableResult | null>(null);

  const [morningTime, setMorningTime] = useState("09:00");
  const [eveningTime, setEveningTime] = useState("20:30");
  const [enableResult, setEnableResult] = useState<PushEnableResult | null>(
    null,
  );

  useEffect(() => {
    if (data) {
      setMorningTime(data.morningReminderTime);
      setEveningTime(data.eveningReminderTime);
    }
  }, [data]);

  // Deux préférences utilisent le push de cet appareil : il reste abonné tant
  // que l'une des deux est active.
  const wantsPush = !!data?.coParentActivityOptIn || !!data?.formationReminderOptIn;
  useEffect(() => {
    if (wantsPush) {
      void reconcilePushSubscription(true);
    }
  }, [wantsPush]);

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

  // Single toggle: enabling requests browser permission + subscribes
  // before the account preference flips, so the two never drift apart.
  const toggleCoParentActivity = async (checked: boolean) => {
    if (checked) {
      const result = await push.enable();
      setEnableResult(result);
      if (result === "subscribed") {
        update.mutate({ coParentActivityOptIn: true });
      }
    } else {
      setEnableResult(null);
      if (!data.formationReminderOptIn) await push.disable();
      update.mutate({ coParentActivityOptIn: false });
    }
  };

  // L'email part dès que la case est cochée ; le push est un plus, proposé
  // par un bouton (la permission navigateur exige un geste de l'utilisateur).
  const toggleFormationReminder = async (checked: boolean) => {
    if (!checked) {
      setFormationPush(null);
      if (!data.coParentActivityOptIn) await push.disable();
    }
    update.mutate({ formationReminderOptIn: checked });
  };
  const enableFormationPush = async () => {
    setFormationPush(await push.enable());
  };
  const showFormation = billing?.ownsFormation === true;
  const formationPushOn = push.isSupported && push.permission === "granted";

  let coParentHint: "unsupported" | "blocked" | "unavailable" | null = null;
  if (!push.isSupported) {
    coParentHint = "unsupported";
  } else if (
    enableResult === "denied" ||
    (data.coParentActivityOptIn && push.permission === "denied")
  ) {
    coParentHint = "blocked";
  } else if (enableResult === "unconfigured") {
    coParentHint = "unavailable";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4 text-muted-foreground" />
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
              className="size-5"
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
              className="size-5"
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
            className="size-5"
            checked={data.weeklyDigestOptIn}
            disabled={update.isPending}
            onCheckedChange={(checked) =>
              update.mutate({ weeklyDigestOptIn: checked === true })
            }
          />
        </label>
        {showFormation && (
          <div className="rounded-lg border border-border/60 px-3 py-2.5">
            <label
              htmlFor="formation-reminder"
              className="flex min-h-10 cursor-pointer items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <span className="block text-sm font-medium">
                  {t("notifications.formationReminder")}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("notifications.formationReminderBody")}
                </p>
              </div>
              <Checkbox
                id="formation-reminder"
                className="size-5"
                checked={data.formationReminderOptIn}
                disabled={update.isPending || push.isBusy}
                onCheckedChange={(checked) => toggleFormationReminder(checked === true)}
              />
            </label>
            {data.formationReminderOptIn && push.isSupported && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                <span aria-live="polite">
                  {formationPushOn
                    ? t("notifications.formationReminderPushOn")
                    : formationPush === "denied" || push.permission === "denied"
                      ? t("notifications.coParentActivityBlocked")
                      : formationPush === "unconfigured"
                        ? t("notifications.coParentActivityUnavailable")
                        : t("notifications.formationReminderEmailOnly")}
                </span>
                {!formationPushOn && push.permission !== "denied" && formationPush !== "unconfigured" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={push.isBusy}
                    onClick={enableFormationPush}
                  >
                    {t("notifications.formationReminderPushCta")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        <div className="rounded-lg border border-border/60 px-3 py-2.5">
          <label
            htmlFor="co-parent-activity"
            className="flex min-h-10 cursor-pointer items-center justify-between gap-4"
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
              className="size-5"
              checked={data.coParentActivityOptIn}
              disabled={!push.isSupported || push.isBusy || update.isPending}
              onCheckedChange={(checked) =>
                toggleCoParentActivity(checked === true)
              }
            />
          </label>
          {coParentHint && (
            <p className="mt-2.5 border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
              {coParentHint === "unsupported" &&
                t("notifications.coParentActivityUnsupported")}
              {coParentHint === "blocked" &&
                t("notifications.coParentActivityBlocked")}
              {coParentHint === "unavailable" &&
                t("notifications.coParentActivityUnavailable")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
