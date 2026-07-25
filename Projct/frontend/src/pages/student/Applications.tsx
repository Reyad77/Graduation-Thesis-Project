import { useTranslation } from "react-i18next";

/** Student's application history page. */
export default function StudentApplications() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.applications")}</h1>
      <p className="text-gray-500 mt-2">Your job applications.</p>
    </div>
  );
}
