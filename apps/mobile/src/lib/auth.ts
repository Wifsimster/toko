import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { API_URL } from "./config";

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
    }),
  ],
});

/**
 * Returns the stored session cookie header to attach to raw API calls.
 * Empty string when the user is signed out.
 */
export function getSessionCookie(): string {
  return authClient.getCookie();
}
