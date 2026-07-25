import { useTranslation } from "react-i18next";

/** Resume preview / detail page. */
export default function StudentResumeView() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("resume.preview")}</h1>
      <p className="text-gray-500 mt-2">Your resume preview.</p>
    </div>
  );
}
