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

export { MO_TIPS, moTipOfTheDay, type MoTipContext, type MoTipEntry } from "@focusflow/mo/tips";

const STORAGE_KEY = "toko.moTips.dismissed";

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
  });
}

export function useMoTip(context: MoTipContext): {
  tip: MoTipEntry | undefined;
  dismiss: () => void;
} {
  const [dismissals, setDismissals] = useState<MoTipDismissals | undefined>(cache);
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
