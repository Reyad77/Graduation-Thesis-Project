import { useTranslation } from "react-i18next";

/** Admin job audit / moderation page. */
export default function AdminJobAudit() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.auditJobs")}</h1>
      <p className="text-gray-500 mt-2">Review and approve job postings.</p>
    </div>
  );
}
