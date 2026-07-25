import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * Simple site footer with copyright and links.
 */
export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {year} {t("app.name")}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
