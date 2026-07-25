import { useTranslation } from "react-i18next";

/** Job listing page with filters. */
export default function JobList() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.jobs")}</h1>
      <p className="text-gray-500 mt-2">Browse available part-time jobs.</p>
    </div>
  );
}
