import { useTranslation } from "react-i18next";

/** Enterprise registration — business license upload and profile setup. */
export default function EnterpriseRegistration() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.register")}</h1>
      <p className="text-gray-500 mt-2">Complete your enterprise registration.</p>
    </div>
  );
}
