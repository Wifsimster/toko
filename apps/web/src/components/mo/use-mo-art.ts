import { useEffect, useState } from "react";
import { loadMoArt, type MoArt, type MoSize, type MoState } from "@focusflow/mo";

// Un module par état × taille (voir @focusflow/mo). Le cache garde les
// dessins déjà chargés pour qu'un second affichage soit synchrone, sans
// clignotement.
const cache = new Map<string, MoArt>();
const pending = new Map<string, Promise<MoArt>>();

const key = (state: MoState, size: MoSize) => `${state}:${size}`;

function fetchArt(state: MoState, size: MoSize): Promise<MoArt> {
  const k = key(state, size);
  const inFlight = pending.get(k);
  if (inFlight) return inFlight;
  const promise = loadMoArt(state, size).then((art) => {
    cache.set(k, art);
    pending.delete(k);
    return art;
  });
  pending.set(k, promise);
  return promise;
}

/** Précharge des dessins (par exemple avant d'ouvrir l'onboarding). */
export function preloadMoArt(
  entries: ReadonlyArray<readonly [MoState, MoSize]>
): Promise<void> {
  return Promise.all(entries.map(([s, z]) => fetchArt(s, z))).then(() => undefined);
}

export function useMoArt(state: MoState, size: MoSize): MoArt | null {
  const k = key(state, size);
  const [loaded, setLoaded] = useState<{ key: string; art: MoArt } | null>(null);
  const cached = cache.get(k);

  useEffect(() => {
    if (cache.has(k)) return;
    let alive = true;
    fetchArt(state, size).then(
      (art) => {
        if (alive) setLoaded({ key: k, art });
      },
      () => {
        // Dessin décoratif : un échec de chargement (hors ligne, nouveau
        // déploiement) laisse la place vide plutôt que de casser l'écran.
      }
    );
    return () => {
      alive = false;
    };
  }, [k, state, size]);

  if (cached) return cached;
  return loaded?.key === k ? loaded.art : null;
}
