import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, Building2, Briefcase,
  Megaphone, Image, ChevronLeft, ChevronRight, LogOut, Menu, X, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const navKeys = [
  { to: "/admin", icon: LayoutDashboard, key: "dashboard", exact: true },
  { to: "/admin/users", icon: Users, key: "users" },
  { to: "/admin/verify-students", icon: UserCheck, key: "verify" },
  { to: "/admin/approve-enterprises", icon: Building2, key: "approve" },
  { to: "/admin/jobs", icon: Briefcase, key: "jobs" },
  { to: "/admin/announcements", icon: Megaphone, key: "news" },
  { to: "/admin/banners", icon: Image, key: "media" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = navKeys.map(item => ({
    ...item,
    label: t(`admin.${item.key}`),
  }));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const sidebar = (
    <>
      <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-primary-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Zap size={14} className="text-primary-600" />
            </div>
            <span className="font-bold text-xs text-white tracking-wider uppercase">{t("admin.adminPanel")}</span>
          </div>
        )}
        <button onClick={() => setCollapsed(v => !v)}
          className="hidden md:flex p-1 rounded-lg hover:bg-primary-700 text-primary-300 hover:text-white shrink-0 transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-primary-200">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                ${active
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-primary-100 hover:text-white hover:bg-primary-600/50"
                } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-primary-700 p-3 shrink-0">
        <div className={`flex items-center gap-2 mb-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {user?.displayName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[11px] text-white truncate font-medium">{user?.displayName}</p>
              <p className="text-[9px] text-primary-300">{t("admin.administrator")}</p>
            </div>
          )}
        </div>
        <button onClick={handleLogout}
          className={`flex items-center gap-2 text-[10px] text-primary-300 hover:text-red-300 transition-colors w-full
            ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={12} className="shrink-0" /> {!collapsed && t("admin.signOut")}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar — fixed, never scrolls */}
      <aside className={`bg-primary-700 flex-col transition-all duration-300 shrink-0 hidden md:flex h-screen sticky top-0
        ${collapsed ? "w-[60px]" : "w-[220px]"}`}>
        {sidebar}
      </aside>

      {/* Main content — scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30 shadow-sm">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
          <span className="text-xs text-gray-500 font-medium tracking-wide uppercase hidden md:block">
            {navItems.find(i => isActive(i.to, i.exact))?.label || t("admin.overview")}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-primary-700 flex flex-col">
            {sidebar}
          </aside>
        </div>
      )}
    </div>
  );
}
