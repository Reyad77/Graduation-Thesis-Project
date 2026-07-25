import { useTranslation } from "react-i18next";

/** Enterprise applicants management page. */
export default function EnterpriseApplicants() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.applicants")}</h1>
      <p className="text-gray-500 mt-2">View and manage your applicants.</p>
    </div>
  );
}
