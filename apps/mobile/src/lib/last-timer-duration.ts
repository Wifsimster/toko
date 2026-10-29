import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { clampTimerDuration, resolveInitialTimerDuration } from "@focusflow/validators";

const STORAGE_KEY = "toko.timer.lastDurationSec";

export function useLastTimerDuration(): {
  initial: number | undefined;
  remember: (sec: number) => void;
} {
  const [initial, setInitial] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(resolveInitialTimerDuration, () => 0)
      .then((sec) => {
        if (mounted) setInitial(sec);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const remember = useCallback((sec: number) => {
    const value = clampTimerDuration(sec);
    if (value <= 0) return;
    void AsyncStorage.setItem(STORAGE_KEY, String(value)).catch(() => {
    });
  }, []);

  return { initial, remember };
}
