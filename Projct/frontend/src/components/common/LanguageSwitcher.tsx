import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/utils/constants";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Language switcher dropdown — shows a globe icon and a list of
 * supported languages. Clicking a language switches the UI immediately.
 */
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { setLanguage, currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600
          hover:bg-gray-100 transition-colors"
        aria-label={t("common.language")}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current?.nativeName ?? "English"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-72 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors
                ${currentLang === lang.code ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"}`}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
