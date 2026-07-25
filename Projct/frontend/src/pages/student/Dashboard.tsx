import { useTranslation } from "react-i18next";

/** Student dashboard — overview of applications, recommended jobs, etc. */
export default function StudentDashboard() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {t("navigation.dashboard")}
      </h1>
      <p className="text-gray-500 mt-2">Welcome! This is your student dashboard.</p>
    </div>
  );
}
