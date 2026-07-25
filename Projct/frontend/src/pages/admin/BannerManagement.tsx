import { useTranslation } from "react-i18next";

/** Admin banner management page. */
export default function AdminBannerManagement() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.banners")}</h1>
      <p className="text-gray-500 mt-2">Manage homepage banners.</p>
    </div>
  );
}
