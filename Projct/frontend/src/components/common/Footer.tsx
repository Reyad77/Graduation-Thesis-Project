import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            &copy; {year} {t("app.name")}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/about" className="hover:text-white transition-colors">{t("footer.about")}</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
