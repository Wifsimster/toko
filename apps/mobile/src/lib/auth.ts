import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { API_URL } from "./config";

/**
 * Options the Expo plugin hands to `expo-web-browser` when it opens the OAuth
 * flow. The plugin reads this object at each sign-in (it does not copy it), so
 * `preferChromeForOAuth()` can fill it in just before the flow starts.
 */
const webBrowserOptions: WebBrowser.AuthSessionOpenOptions = {};

/**
 * Better Auth client for the mobile app.
 *
 * The Expo plugin stores the session cookie in `expo-secure-store` and replays
 * it on requests, so we keep the exact same session model as the web app — no
 * breaking backend change. The backend only needs the additive `expo()` server
 * plugin and the `toko://` scheme added to `trustedOrigins`
 * (see docs/android-app.md).
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "toko",
      storagePrefix: "toko",
      storage: SecureStore,
      webBrowserOptions,
    }),
  ],
});

const CHROME_PACKAGE = "com.android.chrome";

/**
 * Android only: open the OAuth Custom Tab in Chrome when it is installed,
 * whatever the default browser is. Call it right before `signIn.social`.
 *
 * Why: Brave's Custom Tab blocks the server's final redirect to `toko://`, so
 * the app never gets the session back (seen on a real phone; Chrome works).
 * If Chrome is missing or disabled, the default browser is used as before.
 *
 * `servicePackages` is checked too: when a default browser is set, Android may
 * list only that one in `browserPackages`, while the Custom Tabs service query
 * returns every installed, enabled browser.
 */
export async function preferChromeForOAuth(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    const { browserPackages, servicePackages } =
      await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    const hasChrome =
      browserPackages.includes(CHROME_PACKAGE) || servicePackages.includes(CHROME_PACKAGE);
    webBrowserOptions.browserPackage = hasChrome ? CHROME_PACKAGE : undefined;
  } catch (e) {
    // Detection failed: keep the default browser rather than block sign-in.
    console.warn("[auth] custom tabs detection failed", String(e));
    webBrowserOptions.browserPackage = undefined;
  }
}

/**
 * Returns the stored session cookie header to attach to raw API calls.
 * Empty string when the user is signed out.
 */
export function getSessionCookie(): string {
  return authClient.getCookie();
}
