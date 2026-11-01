import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { shouldOfferWizard, type SetupOffer } from "@focusflow/validators";

import { authClient } from "../lib/auth";
import { usePreferences } from "../hooks/use-preferences";
import { onLinkOrNotification, openedFromLinkOrNotification } from "./linking";
import { useMobileTabs } from "./tabs";

export type SetupWizardMode = "first" | "relaunch";

const SEEN_KEY = "toko.setupWizard.seen";
const LATE_AFTER_MS = 3000;

const seenKey = (userId: string) => `${SEEN_KEY}.${userId}`;

function markSeen(userId: string) {
  void AsyncStorage.setItem(seenKey(userId), "1").catch(() => {});
}

type SetupWizardValue = {
  mode: SetupWizardMode | null;
  start: (mode: SetupWizardMode) => void;
  finish: () => void;
};

const SetupWizardContext = createContext<SetupWizardValue | null>(null);

export function SetupWizardProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const prefs = usePreferences();
  const { ready } = useMobileTabs();
  const [seen, setSeen] = useState<{ userId: string; value: boolean } | null>(null);
  const [openedFromLink, setOpenedFromLink] = useState<boolean | undefined>(undefined);
  const [interrupted, setInterrupted] = useState(false);
  const [late, setLate] = useState(false);
  const [decision, setDecision] = useState<SetupOffer>("wait");
  const [mode, setMode] = useState<SetupWizardMode | null>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    AsyncStorage.getItem(seenKey(userId))
      .then((raw) => {
        if (alive) setSeen({ userId, value: raw === "1" });
      })
      .catch(() => {
        if (alive) setSeen({ userId, value: true });
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;
    openedFromLinkOrNotification()
      .catch(() => true)
      .then((value) => {
        if (alive) setOpenedFromLink(value);
      });
    const unsubscribe = onLinkOrNotification(() => setInterrupted(true));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setLate(true), LATE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  const seenValue = userId && seen?.userId === userId ? seen.value : undefined;
  const settled =
    (prefs.isSuccess && !prefs.isFetching) || prefs.isError || prefs.fetchStatus === "paused";
  const offer = shouldOfferWizard({
    userId,
    seen: seenValue,
    openedFromLink,
    interrupted,
    late,
    settled,
    prefs: prefs.data,
  });

  useEffect(() => {
    if (decision !== "wait" || offer === "wait") return;
    setDecision(offer);
    if (offer === "offer") setMode("first");
    if (offer === "never" && seenValue === false && userId) markSeen(userId);
  }, [decision, offer, seenValue, userId]);

  useEffect(() => {
    if (interrupted && mode === "first") setMode(null);
  }, [interrupted, mode]);

  const start = useCallback((next: SetupWizardMode) => setMode(next), []);
  const finish = useCallback(() => {
    if (userId) {
      markSeen(userId);
      setSeen({ userId, value: true });
    }
    setMode(null);
  }, [userId]);

  const value = useMemo<SetupWizardValue>(() => ({ mode, start, finish }), [mode, start, finish]);

  return <SetupWizardContext.Provider value={value}>{children}</SetupWizardContext.Provider>;
}

export function useSetupWizard(): SetupWizardValue {
  const ctx = useContext(SetupWizardContext);
  if (!ctx) throw new Error("useSetupWizard must be used within SetupWizardProvider");
  return ctx;
}
