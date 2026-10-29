import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { clampTimerDuration, resolveInitialTimerDuration } from "@focusflow/validators";

// Dernière durée lancée au minuteur libre, gardée sur l'appareil : la roue
// s'ouvre dessus la fois suivante. Rien de sensible : AsyncStorage, comme
// `toko.moTips.dismissed`. Lecture et bornage dans @focusflow/validators
// (`resolveInitialTimerDuration`, testé).
const STORAGE_KEY = "toko.timer.lastDurationSec";

/**
 * `initial` vaut `undefined` tant que le stockage n'est pas relu (la roue
 * attend, pour ne pas sauter d'une valeur à l'autre sous les yeux du parent),
 * puis la dernière durée lancée, ou 0 s'il n'y en a pas.
 */
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
      // Stockage indisponible : la roue repartira de 0 au prochain lancement.
    });
  }, []);

  return { initial, remember };
}
