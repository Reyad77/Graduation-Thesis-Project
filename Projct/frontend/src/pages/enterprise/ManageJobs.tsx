import { useTranslation } from "react-i18next";

/** Enterprise job management page — list, edit, pause, delete jobs. */
export default function ManageJobs() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.manageJobs")}</h1>
      <p className="text-gray-500 mt-2">Manage your job postings.</p>
    </div>
  );
}
