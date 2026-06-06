import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  webUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/** Base URL of the deployed Hono API (the same backend the web app uses). */
export const API_URL = extra.apiUrl ?? "https://toko.app";

/** Base URL of the web app, used to open the Stripe subscription flow. */
export const WEB_URL = extra.webUrl ?? "https://toko.app";
