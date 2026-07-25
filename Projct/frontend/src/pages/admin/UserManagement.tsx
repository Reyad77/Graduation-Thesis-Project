import { useTranslation } from "react-i18next";

/** Admin user management page. */
export default function AdminUserManagement() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.users")}</h1>
      <p className="text-gray-500 mt-2">Manage platform users.</p>
    </div>
  );
}
