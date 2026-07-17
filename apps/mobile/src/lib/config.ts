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

/**
 * Base URL of the web app. Used to open web-only feature pages in the browser
 * (rapport, insights, rewards, discord). NOT a payment/checkout link: Google
 * Play forbids steering to external payment, so the abonnement is never linked
 * from the app — premium is read-only here (see project_mobile_billing).
 */
export const WEB_URL = extra.webUrl ?? "https://toko.app";
