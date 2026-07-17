import { useEffect } from "react";

import { reconcileLocalReminders } from "../lib/notifications";
import { loadPhoneReminderPrefs } from "./use-phone-reminders";
import { usePreferences } from "./use-preferences";

/**
 * Keeps the OS-scheduled phone reminders in line with the parent's choices on
 * every launch, honouring the device's phone opt-ins and the account's reminder
 * times. Idempotent — the Réglages screen reconciles the same way on change.
 *
 * Lives at the authenticated root (not on a single screen) so it runs for BOTH
 * the full port and the Phase 4 companion. The companion never mounts
 * HomeScreen, so scheduling the local reminders here is what makes the
 * companion's decisive feature — exact morning/evening notifications — actually
 * fire.
 */
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
