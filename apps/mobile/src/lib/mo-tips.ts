import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  dismissMoTip,
  moTipOfTheDay,
  NO_MO_TIP_DISMISSALS,
  parseMoTipDismissals,
  type MoTipContext,
  type MoTipDismissals,
  type MoTipEntry,
} from "@focusflow/mo/tips";

// Les conseils et leur rotation vivent dans @focusflow/mo/tips (logique pure,
// testée par vitest) ; ici, seulement le stockage sur l'appareil.
export { MO_TIPS, moTipOfTheDay, type MoTipContext, type MoTipEntry } from "@focusflow/mo/tips";

// Conseils masqués (« Masquer le conseil »), comme `ui-store.dismissedTips`
// sur le web. Rien de sensible : AsyncStorage, comme `toko.knowledge.read`.
const STORAGE_KEY = "toko.moTips.dismissed";

// Partagé entre les écrans montés en même temps (onglets) : un masquage sur
// un écran ne doit pas être écrasé par l'état périmé d'un autre.
let cache: MoTipDismissals | undefined;
let pending: Promise<MoTipDismissals> | undefined;
const listeners = new Set<(d: MoTipDismissals) => void>();

function load(): Promise<MoTipDismissals> {
  if (cache) return Promise.resolve(cache);
  pending ??= AsyncStorage.getItem(STORAGE_KEY)
    .then(parseMoTipDismissals, () => NO_MO_TIP_DISMISSALS)
    .then((d) => {
      cache ??= d;
      return cache;
    });
  return pending;
}

function save(next: MoTipDismissals) {
  cache = next;
  for (const l of listeners) l(next);
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
    // Stockage indisponible : le conseil reviendra au prochain lancement.
  });
}

/**
 * Le conseil du jour de Mō pour un écran, et de quoi le masquer. Rien tant
 * que le stockage n'est pas relu : un conseil déjà masqué ne doit pas
 * apparaître une fraction de seconde puis disparaître.
 */
export function useMoTip(context: MoTipContext): {
  tip: MoTipEntry | undefined;
  dismiss: () => void;
} {
  const [dismissals, setDismissals] = useState<MoTipDismissals | undefined>(cache);
  // Le jour de l'ouverture de l'écran : le conseil ne change pas sous les
  // yeux du parent, même à minuit.
  const [today] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    listeners.add(setDismissals);
    void load().then((d) => {
      if (alive) setDismissals(d);
    });
    return () => {
      alive = false;
      listeners.delete(setDismissals);
    };
  }, []);

  const tip = dismissals ? moTipOfTheDay(context, today, dismissals) : undefined;
  const tipId = tip?.id;
  const dismiss = useCallback(() => {
    if (!tipId) return;
    save(dismissMoTip(cache ?? NO_MO_TIP_DISMISSALS, context, tipId, today));
  }, [context, tipId, today]);

  return { tip, dismiss };
}
