import { useEffect, useState, useSyncExternalStore } from "react";
import { loadMoArt, type MoArt, type MoSize, type MoState, type MoTheme } from "@focusflow/mo";

// Un module par état × taille × thème (voir @focusflow/mo). Le cache garde
// les dessins déjà chargés pour qu'un second affichage soit synchrone, sans
// clignotement.
const cache = new Map<string, MoArt>();
const pending = new Map<string, Promise<MoArt>>();

const key = (state: MoState, size: MoSize, theme: MoTheme) => `${state}:${size}:${theme}`;

function fetchArt(state: MoState, size: MoSize, theme: MoTheme): Promise<MoArt> {
  const k = key(state, size, theme);
  const inFlight = pending.get(k);
  if (inFlight) return inFlight;
  const promise = loadMoArt(state, size, theme).then((art) => {
    cache.set(k, art);
    pending.delete(k);
    return art;
  });
  pending.set(k, promise);
  return promise;
}

function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const readTheme = (): MoTheme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/** Thème de Mō, lu sur la classe `.dark` de <html> (posée par next-themes). */
export function useMoTheme(): MoTheme {
  return useSyncExternalStore(subscribeToThemeClass, readTheme, () => "light");
}

/** Précharge des dessins (par exemple avant d'ouvrir l'onboarding), dans le thème courant. */
export function preloadMoArt(entries: ReadonlyArray<readonly [MoState, MoSize]>): Promise<void> {
  const theme = typeof document === "undefined" ? "light" : readTheme();
  return Promise.all(entries.map(([s, z]) => fetchArt(s, z, theme))).then(() => undefined);
}

export function useMoArt(state: MoState, size: MoSize): MoArt | null {
  const theme = useMoTheme();
  const k = key(state, size, theme);
  const [loaded, setLoaded] = useState<{ key: string; art: MoArt } | null>(null);
  const cached = cache.get(k);

  useEffect(() => {
    if (cache.has(k)) return;
    let alive = true;
    fetchArt(state, size, theme).then(
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
  }, [k, state, size, theme]);

  if (cached) return cached;
  return loaded?.key === k ? loaded.art : null;
}
