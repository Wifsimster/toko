import { useCallback, useState, useSyncExternalStore } from "react";
import {
  consumeDeferredInstallEvent,
  getDeferredInstallEvent,
  subscribeInstallState,
  wasAppInstalled,
} from "@/lib/install-prompt";

const DISMISS_KEY = "toko:install-dismissed-at";
// Re-prompt at most every 30 days after a dismissal.
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS Safari uses a non-standard `standalone` flag.
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return (
    iosStandalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches
  );
}

function isIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

function recentlyDismissed() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export type InstallMode = "native" | "ios" | "unavailable";

export interface UseInstallPromptResult {
  canPrompt: boolean;
  mode: InstallMode;
  install: () => Promise<"accepted" | "dismissed" | "unsupported">;
  dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const deferred = useSyncExternalStore(
    subscribeInstallState,
    getDeferredInstallEvent,
    () => null,
  );
  const appInstalled = useSyncExternalStore(
    subscribeInstallState,
    wasAppInstalled,
    () => false,
  );
  const [standalone] = useState(() => isStandalone());
  const [dismissed, setDismissed] = useState(() => recentlyDismissed());
  const [iosEligible] = useState(() => isIos() && !isStandalone());

  const installed = standalone || appInstalled;

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors (private mode, quota, etc.).
    }
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return "unsupported" as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    consumeDeferredInstallEvent();
    if (outcome === "dismissed") dismiss();
    return outcome;
  }, [deferred, dismiss]);

  const mode: InstallMode = deferred
    ? "native"
    : iosEligible
      ? "ios"
      : "unavailable";

  const canPrompt = !installed && !dismissed && mode !== "unavailable";

  return { canPrompt, mode, install, dismiss };
}
