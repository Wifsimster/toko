import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** `true` quand « Réduire les animations » est actif dans le système. */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduceMotion;
}

/**
 * Lance `start` seulement si « Réduire les animations » est inactif. On
 * relit le réglage au lieu de se fier à `useReduceMotion`, qui vaut `false`
 * tant que la réponse du système n'est pas arrivée : sinon Mō bougerait
 * quelques images au premier affichage. Renvoie l'annulation.
 */
export function whenMotionAllowed(start: () => () => void): () => void {
  let stop: (() => void) | undefined;
  let alive = true;
  AccessibilityInfo.isReduceMotionEnabled().then(
    (reduced) => {
      if (alive && !reduced) stop = start();
    },
    () => {
      // Réglage illisible : on reste immobile.
    },
  );
  return () => {
    alive = false;
    stop?.();
  };
}
