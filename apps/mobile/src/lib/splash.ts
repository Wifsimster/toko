import * as SplashScreen from "expo-splash-screen";

let hidden = false;

export function holdNativeSplash(): void {
  SplashScreen.preventAutoHideAsync().catch(() => {
  });
}

export function hideNativeSplash(): void {
  if (hidden) return;
  hidden = true;
  SplashScreen.hideAsync().catch(() => {
  });
}
