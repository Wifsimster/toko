import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  webUrl?: string;
  companionMode?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const COMPANION_MODE = extra.companionMode === true;

export const API_URL = extra.apiUrl ?? "https://toko.app";

export const WEB_URL = extra.webUrl ?? "https://toko.app";
