import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

/**
 * Registration form with role selection (student / enterprise).
 *
 * After registration the user is automatically logged in and redirected.
 */
export default function RegisterForm() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, displayName, role);
      // Redirect to profile completion based on role
      if (role === "student") navigate("/student/profile");
      else if (role === "enterprise") navigate("/enterprise/register");
      else navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Role selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("auth.chooseRole")}
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors
              ${role === "student"
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {t("auth.student")}
          </button>
          <button
            type="button"
            onClick={() => setRole("enterprise")}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors
              ${role === "enterprise"
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {t("auth.enterprise")}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          {t("auth.displayName")}
        </label>
        <input
          id="displayName"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t("auth.password")}
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          {t("auth.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? t("common.loading") : t("auth.register")}
      </button>

      <p className="text-sm text-center text-gray-500">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="text-primary-600 hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </form>
  );
}
