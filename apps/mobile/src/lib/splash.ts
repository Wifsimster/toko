import * as SplashScreen from "expo-splash-screen";

let hidden = false;

/**
 * Garde l'écran de démarrage natif (Mō sur crème, `app.json`) tant que le
 * premier écran n'est pas prêt. À appeler une fois, au chargement du module
 * racine : appelé plus tard, l'écran natif est peut-être déjà parti.
 */
export function holdNativeSplash(): void {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Déjà caché ou module absent : rien à garder.
  });
}

/** Retire l'écran de démarrage natif, une seule fois ; les appels suivants ne font rien. */
export function hideNativeSplash(): void {
  if (hidden) return;
  hidden = true;
  SplashScreen.hideAsync().catch(() => {
    // Déjà caché : rien à faire.
  });
}
