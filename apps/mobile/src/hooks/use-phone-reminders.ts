import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "toko.notifications.phone";

export type PhoneReminderPrefs = {
  morningPhone: boolean;
  eveningPhone: boolean;
};

export const PHONE_REMINDER_DEFAULTS: PhoneReminderPrefs = {
  morningPhone: false,
  eveningPhone: false,
};

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
    return PHONE_REMINDER_DEFAULTS;
  }
}

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
        },
      );
      return next;
    });
  }, []);

  return { prefs, loaded, update };
}
