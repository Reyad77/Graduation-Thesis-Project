import { useTranslation } from "react-i18next";

/** Admin dashboard — platform statistics and quick actions. */
export default function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
      <p className="text-gray-500 mt-2">Platform administration dashboard.</p>
    </div>
  );
}
