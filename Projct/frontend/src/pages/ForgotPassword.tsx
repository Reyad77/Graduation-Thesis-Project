import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import authService from "@/services/authService";

/**
 * Forgot password page — sends a password-reset email.
 */
export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t("auth.forgotPassword")}
          </h1>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
                Password reset link sent! Check your email inbox.
              </div>
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:underline"
              >
                {t("auth.login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? t("common.loading") : t("auth.sendResetLink")}
              </button>
              <p className="text-sm text-center text-gray-500">
                <Link to="/login" className="text-primary-600 hover:underline">
                  {t("auth.login")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
