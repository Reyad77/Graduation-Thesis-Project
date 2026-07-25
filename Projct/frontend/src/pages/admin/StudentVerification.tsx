import { useTranslation } from "react-i18next";

/** Admin student ID verification queue. */
export default function AdminStudentVerification() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.verifyStudents")}</h1>
      <p className="text-gray-500 mt-2">Verify student identity documents.</p>
    </div>
  );
}
