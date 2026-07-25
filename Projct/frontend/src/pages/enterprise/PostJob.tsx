import { useTranslation } from "react-i18next";

/** Job posting creation page. */
export default function PostJob() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.postJob")}</h1>
      <p className="text-gray-500 mt-2">Post a new part-time job.</p>
    </div>
  );
}
