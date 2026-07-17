import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  webUrl?: string;
  companionMode?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Phase 4 companion mode. When true, the app boots as the 3-screen companion
 * (routine du matin, routine du soir, timer-animal) instead of the full port —
 * the "compagnon" the strategy calls for. Toggled via app.json `extra` so the
 * same codebase ships either surface; the full port stays the default until the
 * closed beta confirms the native companion is wanted.
 */
export const COMPANION_MODE = extra.companionMode === true;

/** Base URL of the deployed Hono API (the same backend the web app uses). */
export const API_URL = extra.apiUrl ?? "https://toko.app";

/** Base URL of the web app, used to open the Stripe subscription flow. */
export const WEB_URL = extra.webUrl ?? "https://toko.app";
