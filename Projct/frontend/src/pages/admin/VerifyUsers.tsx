import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Shield, Clock, UserCheck, Building2 } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminVerifyUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"students" | "enterprises">("students");

  const fetch = () => { adminService.getUsers().then(u => setUsers(Array.isArray(u) ? u : u)).finally(() => setIsLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const students = users.filter(u => u.role === "student");
  const enterprises = users.filter(u => u.role === "enterprise");

  const handleVerify = async (uid: string) => { try { await adminService.verifyStudent(uid); toast.success(t("admin.verifiedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const handleDeclineStudent = async (uid: string) => { const r = prompt(t("admin.reasonPrompt")); if (!r) return; try { await adminService.declineStudent(uid, r); toast.success(t("admin.rejectedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const handleApprove = async (uid: string) => { try { await adminService.approveEnterprise(uid); toast.success(t("admin.approvedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const handleDeclineEnterprise = async (uid: string) => { const r = prompt(t("admin.reasonPrompt")); if (!r) return; try { await adminService.declineEnterprise(uid, r); toast.success(t("admin.rejectedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };

  if (isLoading) return <LoadingSpinner fullPage />;

  const list = tab === "students" ? students : enterprises;
  const stuVerified = students.filter(u => (u as any).isVerified).length;
  const entApproved = enterprises.filter(u => (u as any).isApproved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.verifyUsers")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length + enterprises.length} users</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Shield size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{students.length + enterprises.length}</p><p className="text-[11px] text-gray-500">{t("admin.totalUsers")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><UserCheck size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{students.length}</p><p className="text-[11px] text-gray-500">{t("admin.students")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600"><Building2 size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{enterprises.length}</p><p className="text-[11px] text-gray-500">{t("admin.enterprises")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Clock size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{stuVerified + entApproved}</p><p className="text-[11px] text-gray-500">{t("profile.verified")}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("students")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors
            ${tab === "students" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          {t("admin.students")} ({students.length})
        </button>
        <button onClick={() => setTab("enterprises")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors
            ${tab === "enterprises" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          {t("admin.enterprises")} ({enterprises.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[25%]">{t("admin.name")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.email")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[15%]">{t("admin.status")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => {
              const isDone = tab === "students" ? (u as any).isVerified : (u as any).isApproved;
              return (
                <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${tab === "students" ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600"}`}>
                        {u.displayName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-gray-800">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {isDone ? t("profile.verified") : t("status.pending")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isDone ? (
                      <span className="text-emerald-600 flex items-center justify-end gap-1 text-[11px]"><CheckCircle size={13} /> {t("profile.verified")}</span>
                    ) : (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => tab === "students" ? handleVerify(u.uid) : handleApprove(u.uid)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 flex items-center gap-1">
                          <CheckCircle size={12} /> {t("admin.approve")}
                        </button>
                        <button onClick={() => tab === "students" ? handleDeclineStudent(u.uid) : handleDeclineEnterprise(u.uid)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 flex items-center gap-1">
                          <XCircle size={12} /> {t("admin.reject")}
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
    </div>
  );
}
