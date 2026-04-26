import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import fi from "./locales/fi.json";

export const STORAGE_KEY = "plantbee.lang";

export const SUPPORTED_LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "fi", label: "FI", name: "Suomi" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
const initial = SUPPORTED_LANGS.some((l) => l.code === stored) ? (stored as LangCode) : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    fi: { translation: fi },
  },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
