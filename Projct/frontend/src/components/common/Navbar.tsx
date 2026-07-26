import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Briefcase } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

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
            <NavLink to="/jobs">{t("nav.findJobs")}</NavLink>
            <NavLink to="/applications">{t("nav.myApps")}</NavLink>
            <NavLink to="/saved-jobs">{t("nav.saved")}</NavLink>
          </>
        );
      case "enterprise":
        return (
          <>
            <NavLink to="/enterprise/dashboard">{t("nav.dashboard")}</NavLink>
            <NavLink to="/enterprise/jobs">{t("nav.myPosts")}</NavLink>
            <NavLink to="/enterprise/applicants">{t("nav.candidates")}</NavLink>
          </>
        );
      case "admin":
        return (
          <>
            <NavLink to="/admin/dashboard">{t("nav.dashboard")}</NavLink>
            <NavLink to="/admin/users">{t("nav.users")}</NavLink>
            <NavLink to="/admin/jobs">{t("nav.auditJobs")}</NavLink>
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
          <Link to="/" className="flex items-center gap-2 text-primary-700">
            <Briefcase size={24} />
            <span className="font-bold text-lg hidden sm:inline">{t("app.name")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && <NavLink to="/">{t("nav.home")}</NavLink>}
            {roleLinks()}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to={`/${user?.role}/profile`} className="text-sm text-gray-700 hover:text-primary-600">
                  {user?.displayName}
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">{t("nav.logout")}</button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm">{t("nav.logIn")}</Link>
                  <Link to="/register" className="btn-primary text-sm">{t("nav.signUp")}</Link>
                </div>
              )
            )}

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2 flex flex-col gap-1">
            {isAuthenticated && <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>{t("nav.home")}</MobileNavLink>}
            {isAuthenticated && roleLinks()}
            {isAuthenticated ? (
              <>
                <MobileNavLink to={`/${user?.role}/profile`} onClick={() => setMobileOpen(false)}>{t("nav.profile")}</MobileNavLink>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">{t("nav.logout")}</button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>{t("nav.logIn")}</MobileNavLink>
                  <MobileNavLink to="/register" onClick={() => setMobileOpen(false)}>{t("nav.signUp")}</MobileNavLink>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
      {children}
    </Link>
  );
}
