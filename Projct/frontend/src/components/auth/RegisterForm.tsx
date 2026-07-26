import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { Search, UserPlus } from "lucide-react";

export default function RegisterForm() {
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* ── "I am looking for..." selector ───────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
          I am looking for...
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${role === "student"
                ? "border-primary-500 bg-primary-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            <div className={`p-2.5 rounded-full ${role === "student" ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}>
              <Search size={22} />
            </div>
            <span className={`text-sm font-semibold ${role === "student" ? "text-primary-700" : "text-gray-700"}`}>
              Jobs
            </span>
            <span className="text-[10px] text-gray-400 text-center leading-tight">
              Find part-time work that fits<br />your class schedule
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("enterprise")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${role === "enterprise"
                ? "border-primary-500 bg-primary-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            <div className={`p-2.5 rounded-full ${role === "enterprise" ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}>
              <UserPlus size={22} />
            </div>
            <span className={`text-sm font-semibold ${role === "enterprise" ? "text-primary-700" : "text-gray-700"}`}>
              Employees
            </span>
            <span className="text-[10px] text-gray-400 text-center leading-tight">
              Hire students for your<br />company or business
            </span>
          </button>
        </div>
      </div>

      {/* ── Account fields ───────────────────────────────────── */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 text-center mb-3">
          {role === "student" ? "Create your job seeker account" : "Create your employer account"}
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="displayName" type="text" required value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} className="input-field" placeholder="Your full name" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min 8 characters" />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirmPassword" type="password" required minLength={8} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Re-enter password" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link>
      </p>
    </form>
  );
}
