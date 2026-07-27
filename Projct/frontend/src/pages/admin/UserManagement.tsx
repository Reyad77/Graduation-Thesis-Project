import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Ban, CheckCircle as UnbanIcon, Users, Shield, Building2, MoreVertical, Clock, Trash2 } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

const TIMEOUT_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
  { label: "1 day", value: 1440 },
  { label: "3 days", value: 4320 },
  { label: "7 days", value: 10080 },
  { label: "10 days", value: 14400 },
];

export default function AdminUserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [timeoutUser, setTimeoutUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetch = () => adminService.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])).finally(() => setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBan = async (uid: string) => { try { await adminService.banUser(uid); toast.success(t("admin.bannedToast")); fetch(); setOpenMenu(null); } catch { toast.error(t("admin.failedToast")); } };
  const handleUnban = async (uid: string) => { try { await adminService.unbanUser(uid); toast.success(t("admin.unbannedToast")); fetch(); setOpenMenu(null); } catch { toast.error(t("admin.failedToast")); } };
  const handleTimeout = async (uid: string, minutes: number) => { try { await adminService.timeoutUser(uid, minutes); toast.success(`Timed out for ${minutes}min`); fetch(); setTimeoutUser(null); setOpenMenu(null); } catch { toast.error(t("admin.failedToast")); } };
  const handleDelete = async (uid: string) => { if (!confirm("Permanently delete this user?")) return; try { await adminService.deleteUser(uid); toast.success(t("admin.deletedToast")); fetch(); setOpenMenu(null); } catch { toast.error(t("admin.failedToast")); } };

  if (isLoading) return <LoadingSpinner fullPage />;

  const students = users.filter(u => u.role === "student").length;
  const enterprises = users.filter(u => u.role === "enterprise").length;
  const admins = users.filter(u => u.role === "admin").length;
  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.userMgmtTitle")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} {t("admin.users").toLowerCase()} {t("admin.registered")}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Users size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{users.length}</p><p className="text-[11px] text-gray-500">{t("admin.totalUsers")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Shield size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{students}</p><p className="text-[11px] text-gray-500">{t("admin.students")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600"><Building2 size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{enterprises}</p><p className="text-[11px] text-gray-500">{t("admin.enterprises")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600"><Shield size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{admins}</p><p className="text-[11px] text-gray-500">{t("admin.adminPanel")}</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "student", "enterprise", "admin"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "all" ? t("admin.totalUsers") : f === "student" ? t("admin.students") : f === "enterprise" ? t("admin.enterprises") : t("admin.adminPanel")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[25%]">{t("admin.name")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.email")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[12%]">{t("admin.role")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[12%]">{t("admin.status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[10%]">{t("admin.timeout")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[11%]">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const isTimedOut = !!(u as any).timeoutUntil;
              return (
                <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.displayName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-gray-800">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "enterprise" ? "bg-violet-100 text-violet-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium ${u.isActive ? (isTimedOut ? "text-amber-600" : "text-emerald-600") : "text-red-600"}`}>
                      {isTimedOut ? t("admin.timedOut") : u.isActive ? t("admin.active") : t("admin.banned")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {isTimedOut ? new Date((u as any).timeoutUntil).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === u.uid ? null : u.uid)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <MoreVertical size={14} />
                    </button>
                    {openMenu === u.uid && (
                      <div ref={menuRef} className="absolute right-2 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                        {u.isActive ? (
                          <>
                            <button onClick={() => handleBan(u.uid)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Ban size={12} /> {t("admin.ban")}
                            </button>
                            <button onClick={() => { setTimeoutUser(u); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                              <Clock size={12} /> {t("admin.timeout")}
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleUnban(u.uid)} className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                            <UnbanIcon size={12} /> {t("admin.unban")}
                          </button>
                        )}
                        <hr className="my-0.5" />
                        <button onClick={() => handleDelete(u.uid)} className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                          <Trash2 size={12} /> {t("common.delete")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Timeout modal */}
      {timeoutUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setTimeoutUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("admin.timeoutUser")}</h3>
            <p className="text-sm text-gray-500 mb-4">{timeoutUser.displayName} ({timeoutUser.email})</p>
            <div className="grid grid-cols-2 gap-2">
              {TIMEOUT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleTimeout(timeoutUser.uid, opt.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <span className="font-medium text-gray-800">{opt.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setTimeoutUser(null)} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
