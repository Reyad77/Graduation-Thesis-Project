import { useTranslation } from "react-i18next";

/** Resume create / edit form page. */
export default function StudentResumeForm() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("resume.create")}</h1>
      <p className="text-gray-500 mt-2">Create or edit your resume.</p>
    </div>
  );
}
