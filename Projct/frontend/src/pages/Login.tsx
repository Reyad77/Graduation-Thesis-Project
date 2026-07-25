import { useTranslation } from "react-i18next";
import LoginForm from "@/components/auth/LoginForm";

/**
 * Login page — renders the login form centered on screen.
 */
export default function Login() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("auth.login")}
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
