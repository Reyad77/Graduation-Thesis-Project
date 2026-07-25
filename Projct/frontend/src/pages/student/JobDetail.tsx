import { useTranslation } from "react-i18next";

/** Job detail page. */
export default function JobDetail() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("jobs.title")}</h1>
      <p className="text-gray-500 mt-2">Job details.</p>
    </div>
  );
}
