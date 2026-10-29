import { useEffect } from "react";

import { reconcileLocalReminders } from "../lib/notifications";
import { loadPhoneReminderPrefs } from "./use-phone-reminders";
import { usePreferences } from "./use-preferences";

export function useReminderSync(): void {
  const prefs = usePreferences();

  useEffect(() => {
    if (!prefs.data) return;
    const { morningReminderTime, eveningReminderTime } = prefs.data;
    let cancelled = false;
    void loadPhoneReminderPrefs().then((phone) => {
      if (cancelled) return;
      void reconcileLocalReminders({
        morning: { enabled: phone.morningPhone, time: morningReminderTime },
        evening: { enabled: phone.eveningPhone, time: eveningReminderTime },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [prefs.data]);
}
