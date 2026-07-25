import { useTranslation } from "react-i18next";

/** Enterprise dashboard — overview of posted jobs and analytics. */
export default function EnterpriseDashboard() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
      <p className="text-gray-500 mt-2">Welcome to your enterprise dashboard.</p>
    </div>
  );
}
