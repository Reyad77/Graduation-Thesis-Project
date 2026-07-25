import { useTranslation } from "react-i18next";

/** Student profile page. */
export default function StudentProfile() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.profile")}</h1>
      <p className="text-gray-500 mt-2">Your student profile.</p>
    </div>
  );
}
