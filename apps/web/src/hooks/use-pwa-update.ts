import { useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export interface UsePwaUpdateResult {
  needRefresh: boolean;
  update: () => Promise<void>;
  dismiss: () => void;
}

export function usePwaUpdate(): UsePwaUpdateResult {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        if (!navigator.onLine) return;
        registration.update().catch(() => {
          // Network errors are non-fatal — we'll retry on the next tick.
        });
      };

      const interval = window.setInterval(
        checkForUpdate,
        UPDATE_CHECK_INTERVAL_MS,
      );

      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          checkForUpdate();
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    },
  });

  const update = useCallback(async () => {
    await updateServiceWorker(true);
  }, [updateServiceWorker]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return { needRefresh, update, dismiss };
}
