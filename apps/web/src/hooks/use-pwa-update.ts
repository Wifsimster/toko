import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Garde Tokō à jour sans jamais interrompre le parent.
 *
 * L'ancien comportement affichait « Une nouvelle version est disponible » à
 * chaque livraison, y compris pour un correctif que personne n'avait vu
 * passer. Ici le nouveau service worker prend la main en silence (sans
 * recharger la page en cours d'usage) : la nouvelle version s'applique au
 * prochain chargement. Ce qui est raconté au parent ensuite, c'est le
 * changelog — voir `use-app-updated.ts`.
 *
 * Si la page en cours demande un chunk que le nouveau cache a purgé,
 * `stale-chunk-recovery.ts` recharge une fois et l'app repart propre.
 */
export function useSilentPwaUpdate(): void {
  const {
    needRefresh: [needRefresh],
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

  useEffect(() => {
    if (!needRefresh) return;
    // `false` = on active le nouveau worker sans recharger : personne n'est
    // éjecté d'un formulaire à moitié rempli.
    void updateServiceWorker(false).catch(() => {
      // Un worker qui refuse de s'activer se réessaiera à la prochaine visite.
    });
  }, [needRefresh, updateServiceWorker]);
}
