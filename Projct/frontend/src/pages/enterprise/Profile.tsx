import { useTranslation } from "react-i18next";

/** Enterprise profile page. */
export default function EnterpriseProfile() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.profile")}</h1>
      <p className="text-gray-500 mt-2">Your enterprise profile.</p>
    </div>
  );
}
