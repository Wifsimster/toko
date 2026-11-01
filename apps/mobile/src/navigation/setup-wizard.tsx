import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { serverMobileTabs, setupOffer } from "@focusflow/validators";

import { authClient } from "../lib/auth";
import { usePreferences } from "../hooks/use-preferences";

export type SetupWizardMode = "first" | "relaunch";

const SEEN_KEY = "toko.setupWizard.seen";
const SETTLE_TIMEOUT_MS = 6000;

const seenKey = (userId: string) => `${SEEN_KEY}.${userId}`;

function markSeen(userId: string) {
  void AsyncStorage.setItem(seenKey(userId), "1").catch(() => {});
}

type SetupWizardValue = {
  mode: SetupWizardMode | null;
  pending: boolean;
  start: (mode: SetupWizardMode) => void;
  finish: () => void;
};

const SetupWizardContext = createContext<SetupWizardValue | null>(null);

export function SetupWizardProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const prefs = usePreferences();
  const [seen, setSeen] = useState<{ userId: string; value: boolean } | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [mode, setMode] = useState<SetupWizardMode | null>(null);
  const opened = useRef(false);

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

  const seenValue = !userId ? true : seen?.userId === userId ? seen.value : undefined;

  useEffect(() => {
    if (seenValue !== false) return;
    const timer = setTimeout(() => setTimedOut(true), SETTLE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [seenValue]);

  const settled =
    prefs.isFetchedAfterMount || prefs.isError || prefs.fetchStatus === "paused" || timedOut;
  const server: unknown = prefs.data ? serverMobileTabs(prefs.data) : undefined;
  const offer = setupOffer({ seen: seenValue, settled, server });

  useEffect(() => {
    if (offer === "never" && seenValue === false && userId) {
      markSeen(userId);
      setSeen({ userId, value: true });
    }
  }, [offer, seenValue, userId]);

  useEffect(() => {
    if (offer === "offer" && !opened.current) {
      opened.current = true;
      setMode("first");
    }
  }, [offer]);

  const start = useCallback((next: SetupWizardMode) => setMode(next), []);
  const finish = useCallback(() => {
    if (userId) {
      markSeen(userId);
      setSeen({ userId, value: true });
    }
    setMode(null);
  }, [userId]);

  const value = useMemo<SetupWizardValue>(
    () => ({ mode, pending: offer === "wait", start, finish }),
    [mode, offer, start, finish],
  );

  return <SetupWizardContext.Provider value={value}>{children}</SetupWizardContext.Provider>;
}

export function useSetupWizard(): SetupWizardValue {
  const ctx = useContext(SetupWizardContext);
  if (!ctx) throw new Error("useSetupWizard must be used within SetupWizardProvider");
  return ctx;
}
