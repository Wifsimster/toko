import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./locales/fr.json";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Same rule as the `navigator` detector below: the first browser language we
// support wins, French otherwise.
function detectLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return "fr";
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const base = lang?.toLowerCase().split("-")[0];
    if (base === "fr" || base === "en") return base;
  }
  return "fr";
}

// French ships in the main bundle (default + fallback). English (~110 kB of
// JSON) is only downloaded by English browsers: every French visitor, most of
// them on a phone, saves it.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    partialBundledLanguages: true,
    fallbackLng: "fr",
    supportedLngs: SUPPORTED_LANGUAGES,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["navigator"],
      caches: [],
    },
  });

/** Resolves once the detected language's strings are loaded. Render after it. */
export const i18nReady: Promise<unknown> =
  detectLanguage() === "en"
    ? import("./locales/en.json")
        .then((m) => {
          i18n.addResourceBundle("en", "translation", m.default, true, true);
          return i18n.changeLanguage("en");
        })
        // Offline or stale build: French fallback rather than a blank page.
        .catch(() => undefined)
    : Promise.resolve();

export default i18n;
