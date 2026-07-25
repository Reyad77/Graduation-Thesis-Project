import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/utils/constants";

interface LanguageContextType {
  currentLang: string;
  setLanguage: (code: string) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const isRtl = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.rtl ?? false;

  const setLanguage = useCallback(
    (code: string) => {
      i18n.changeLanguage(code);
      setCurrentLang(code);
      // Update the HTML dir attribute for RTL support
      const rtl = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
      document.documentElement.dir = rtl ? "rtl" : "ltr";
    },
    [i18n],
  );

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
