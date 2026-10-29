import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function useSilentPwaUpdate(): void {
  const router = useRouter();
  const registrationCleanupRef = useRef<(() => void) | null>(null);
  const unmountedRef = useRef(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration || unmountedRef.current) return;

      const checkForUpdate = () => {
        if (!navigator.onLine) return;
        registration.update().catch(() => {
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

      registrationCleanupRef.current = () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    },
  });

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      registrationCleanupRef.current?.();
      registrationCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!needRefresh) return;
    let applied = false;
    const unsubscribe = router.subscribe("onResolved", (event) => {
      if (applied || !event.pathChanged) return;
      applied = true;
      void updateServiceWorker(true).catch(() => {
      });
    });
    return unsubscribe;
  }, [needRefresh, updateServiceWorker, router]);
}
