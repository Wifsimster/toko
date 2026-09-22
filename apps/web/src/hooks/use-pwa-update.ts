import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Garde Tokō à jour sans jamais interrompre le parent.
 *
 * Activer le nouveau service worker recharge la page (vite-plugin-pwa écoute
 * `controlling` et appelle `window.location.reload()`, quel que soit
 * l'argument passé à `updateServiceWorker`). Le faire dès qu'une version est
 * prête éjecterait un parent d'un formulaire à moitié rempli.
 *
 * On attend donc un moment sûr : le prochain changement de page. Le parent
 * vient de quitter l'écran précédent, l'écran d'arrivée est encore vide — le
 * rechargement passe inaperçu. S'il ne change jamais de page, la nouvelle
 * version s'applique simplement au prochain lancement. Ce qui est raconté au
 * parent ensuite, c'est le changelog — voir `use-app-updated.ts`.
 *
 * Si la page en cours demande un chunk que le nouveau cache a purgé,
 * `stale-chunk-recovery.ts` recharge une fois et l'app repart propre.
 */
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

      // vite-plugin-pwa ignore la valeur de retour de ce callback : on garde
      // le nettoyage nous-mêmes pour l'appeler au démontage.
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
        // Un worker qui refuse de s'activer se réessaiera à la prochaine visite.
      });
    });
    return unsubscribe;
  }, [needRefresh, updateServiceWorker, router]);
}
