import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Shield, Clock } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminStudentVerification() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () => { adminService.getUsers().then(u => setUsers(Array.isArray(u) ? u : u)).finally(() => setIsLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleVerify = async (uid: string) => { try { await adminService.verifyStudent(uid); toast.success(t("admin.verifiedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const students = users.filter(u => u.role === "student");
  const verified = students.filter(u => (u as any).isVerified).length;
  const unverified = students.filter(u => !(u as any).isVerified).length;

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.verifyTitle")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} {t("admin.students").toLowerCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Shield size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{students.length}</p><p className="text-[11px] text-gray-500">{t("admin.totalUsers")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{verified}</p><p className="text-[11px] text-gray-500">{t("profile.verified")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Clock size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{unverified}</p><p className="text-[11px] text-gray-500">{t("status.pending")}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[25%]">{t("admin.name")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[35%]">{t("admin.email")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[20%]">{t("admin.status")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[20%]">{t("common.edit")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map(u => {
              const isV = (u as any).isVerified;
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isV ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {isV ? t("profile.verified") : t("status.pending")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isV ? (
                      <span className="text-emerald-600 flex items-center justify-end gap-1 text-[11px]"><CheckCircle size={13} /> {t("profile.verified")}</span>
                    ) : (
                      <button onClick={() => handleVerify(u.uid)} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-[11px] font-medium hover:bg-primary-100 transition-colors">
                        <CheckCircle size={12} className="inline mr-1" />{t("admin.verify")}
                      </button>
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
