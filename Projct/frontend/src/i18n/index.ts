import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Locale resources
import en from "./locales/en/common.json";
import zh from "./locales/zh/common.json";
import bn from "./locales/bn/common.json";
import hi from "./locales/hi/common.json";
import ar from "./locales/ar/common.json";
import nl from "./locales/nl/common.json";
import fr from "./locales/fr/common.json";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  bn: { translation: bn },
  hi: { translation: hi },
  ar: { translation: ar },
  nl: { translation: nl },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
