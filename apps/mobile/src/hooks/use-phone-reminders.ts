import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

/**
 * Phone-channel opt-ins for the daily reminders. Stored *locally* (per device)
 * rather than on the account: a "notification sur le téléphone" is a local
 * OS-scheduled notification owned by this device, so its on/off state belongs
 * with the device — unlike the e-mail reminders, whose opt-in lives in the
 * account preferences and drives the server-side cron jobs.
 */

const STORAGE_KEY = "toko.notifications.phone";

export type PhoneReminderPrefs = {
  morningPhone: boolean;
  eveningPhone: boolean;
};

// Both default OFF: reminders are opt-in (RGPD §7 — consent, not opt-out), the
// same principle the account preferences follow (all reminder opt-ins default
// to false). The parent turns the evening reminder on from the dashboard
// prompt, the companion Matin/Soir toggle, or Réglages.
export const PHONE_REMINDER_DEFAULTS: PhoneReminderPrefs = {
  morningPhone: false,
  eveningPhone: false,
};

/** Reads the stored phone-reminder opt-ins, falling back to the defaults. */
export async function loadPhoneReminderPrefs(): Promise<PhoneReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return PHONE_REMINDER_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PhoneReminderPrefs>;
    return {
      morningPhone: parsed.morningPhone ?? PHONE_REMINDER_DEFAULTS.morningPhone,
      eveningPhone: parsed.eveningPhone ?? PHONE_REMINDER_DEFAULTS.eveningPhone,
    };
  } catch {
    // Corrupt/unavailable storage — fall back to defaults, nothing is lost.
    return PHONE_REMINDER_DEFAULTS;
  }
}

/** Stateful access to the phone-reminder opt-ins, persisted in AsyncStorage. */
export function usePhoneReminderPrefs() {
  const [prefs, setPrefs] = useState<PhoneReminderPrefs>(
    PHONE_REMINDER_DEFAULTS,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadPhoneReminderPrefs().then((p) => {
      if (cancelled) return;
      setPrefs(p);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<PhoneReminderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(
        () => {
          // Fail silent — the toggle still applies for this session and the
          // OS schedule is reconciled regardless.
        },
      );
      return next;
    });
  }, []);

  return { prefs, loaded, update };
}
