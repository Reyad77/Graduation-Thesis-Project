import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, Building2, Briefcase,
  Megaphone, Image, ChevronLeft, ChevronRight, LogOut, Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/verify-students", icon: UserCheck, label: "Verify Students" },
  { to: "/admin/approve-enterprises", icon: Building2, label: "Approve HR" },
  { to: "/admin/jobs", icon: Briefcase, label: "Audit Jobs" },
  { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/admin/banners", icon: Image, label: "Banners" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`bg-gray-900 text-white flex flex-col shrink-0 transition-all duration-200
        ${collapsed ? "w-16" : "w-56"} hidden md:flex`}>
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!collapsed && <span className="font-bold text-sm">Admin Panel</span>}
          <button onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded hover:bg-gray-800 text-gray-400">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive(item.to, item.exact)
                  ? "bg-primary-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-3">
          <div className={`flex items-center gap-2 mb-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.displayName?.charAt(0) || "A"}
            </div>
            {!collapsed && <p className="text-xs text-gray-300 truncate">{user?.displayName}</p>}
          </div>
          <button onClick={handleLogout}
            className={`flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full
              ${collapsed ? "justify-center" : ""}`}>
            <LogOut size={14} /> {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setMobileOpen(v => !v)}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile sidebar overlay ──────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-gray-900 text-white flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <span className="font-bold text-sm">Admin Panel</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400">
                <ChevronLeft size={16} />
              </button>
            </div>
            <nav className="flex-1 py-3 space-y-0.5 px-2">
              {navItems.map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive(item.to, item.exact)
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                  <item.icon size={18} /> <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-800 p-3">
              <button onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 w-full">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
