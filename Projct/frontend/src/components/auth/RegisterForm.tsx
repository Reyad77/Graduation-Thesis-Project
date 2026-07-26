import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { Search, UserPlus } from "lucide-react";

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
    e.preventDefault(); setError("");
    if (password !== confirmPassword) { setError(t("auth.passwordsDontMatch")); return; }
    setIsSubmitting(true);
    try {
      await register(email, password, displayName, role);
      if (role === "student") navigate("/student/profile");
      else if (role === "enterprise") navigate("/enterprise/register");
    } catch { setError(t("auth.registerFailed")); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">{t("auth.lookingFor")}</label>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRole("student")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${role === "student" ? "border-primary-500 bg-primary-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
            <div className={`p-2.5 rounded-full ${role === "student" ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}><Search size={22} /></div>
            <span className={`text-sm font-semibold ${role === "student" ? "text-primary-700" : "text-gray-700"}`}>{t("auth.jobs")}</span>
            <span className="text-[10px] text-gray-400 text-center leading-tight">{t("auth.jobsDesc")}</span>
          </button>
          <button type="button" onClick={() => setRole("enterprise")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${role === "enterprise" ? "border-primary-500 bg-primary-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
            <div className={`p-2.5 rounded-full ${role === "enterprise" ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}><UserPlus size={22} /></div>
            <span className={`text-sm font-semibold ${role === "enterprise" ? "text-primary-700" : "text-gray-700"}`}>{t("auth.employees")}</span>
            <span className="text-[10px] text-gray-400 text-center leading-tight">{t("auth.employeesDesc")}</span>
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 text-center mb-3">
          {role === "student" ? t("auth.jobSeekerAccount") : t("auth.employerAccount")}
        </p>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.fullName")}</label>
            <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
            <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder={t("auth.min8chars")} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.confirmPassword")}</label>
            <input type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder={t("auth.reEnter")} /></div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
        {isSubmitting ? t("auth.creating") : t("auth.createAccount")}
      </button>
      <p className="text-sm text-center text-gray-500">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">{t("auth.logInLink")}</Link>
      </p>
    </form>
  );
}
