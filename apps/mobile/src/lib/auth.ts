import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { API_URL } from "./config";

const webBrowserOptions: WebBrowser.AuthSessionOpenOptions = {};

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

export async function preferChromeForOAuth(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    const { browserPackages, servicePackages } =
      await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    const hasChrome =
      browserPackages.includes(CHROME_PACKAGE) || servicePackages.includes(CHROME_PACKAGE);
    webBrowserOptions.browserPackage = hasChrome ? CHROME_PACKAGE : undefined;
  } catch (e) {
    console.warn("[auth] custom tabs detection failed", String(e));
    webBrowserOptions.browserPackage = undefined;
  }
}

export function getSessionCookie(): string {
  return authClient.getCookie();
}
