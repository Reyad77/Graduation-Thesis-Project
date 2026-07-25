import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Briefcase, Bell } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

/**
 * Main navigation bar displayed at the top of every page.
 *
 * Adapts its links based on the authenticated user's role.
 * Includes the language switcher and notification bell.
 */
export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const roleLinks = () => {
    if (!isAuthenticated || !user) return null;

    switch (user.role) {
      case "student":
        return (
          <>
            <NavLink to="/jobs">{t("navigation.jobs")}</NavLink>
            <NavLink to="/applications">{t("navigation.applications")}</NavLink>
            <NavLink to="/saved-jobs">{t("jobs.savedJobs")}</NavLink>
          </>
        );
      case "enterprise":
        return (
          <>
            <NavLink to="/enterprise/dashboard">{t("navigation.dashboard")}</NavLink>
            <NavLink to="/enterprise/jobs">{t("enterprise.manageJobs")}</NavLink>
            <NavLink to="/enterprise/applicants">{t("enterprise.applicants")}</NavLink>
          </>
        );
      case "admin":
        return (
          <>
            <NavLink to="/admin/dashboard">{t("navigation.dashboard")}</NavLink>
            <NavLink to="/admin/users">{t("admin.users")}</NavLink>
            <NavLink to="/admin/jobs">{t("admin.auditJobs")}</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / brand */}
          <Link to="/" className="flex items-center gap-2 text-primary-700">
            <Briefcase size={24} />
            <span className="font-bold text-lg hidden sm:inline">
              {t("app.name")}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/">{t("navigation.home")}</NavLink>
            {roleLinks()}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to={`/${user?.role}/profile`}
                  className="text-sm text-gray-700 hover:text-primary-600"
                >
                  {user?.displayName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  {t("navigation.logout")}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">
                  {t("navigation.login")}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  {t("navigation.register")}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2 flex flex-col gap-1">
            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
              {t("navigation.home")}
            </MobileNavLink>
            {isAuthenticated && roleLinks()}
            {isAuthenticated ? (
              <>
                <MobileNavLink
                  to={`/${user?.role}/profile`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("navigation.profile")}
                </MobileNavLink>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {t("navigation.logout")}
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>
                  {t("navigation.login")}
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setMobileOpen(false)}>
                  {t("navigation.register")}
                </MobileNavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
    >
      {children}
    </Link>
  );
}
