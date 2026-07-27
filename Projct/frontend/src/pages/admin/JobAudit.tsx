import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Trash2, Briefcase, Clock, Eye } from "lucide-react";
import adminService from "@/services/adminService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminJobAudit() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetch = () => adminService.getAllJobs().then(j => setJobs(Array.isArray(j) ? j : [])).finally(() => setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => { try { await adminService.approveJob(id); toast.success(t("admin.approvedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const reject = async (id: string) => { const n = prompt(t("admin.reasonPrompt")); if (!n) return; try { await adminService.rejectJob(id, n); toast.success(t("admin.rejectedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); } };
  const remove = async (id: string) => { if (!confirm(t("admin.deleteConfirm") || "Delete?")) return; await adminService.removeJob(id); toast.success(t("admin.deletedToast")); fetch(); };

  if (isLoading) return <LoadingSpinner fullPage />;

  const pendingList = jobs.filter(j => j.status === "pending");
  const activeList = jobs.filter(j => j.status === "active");
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.auditTitle")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} {t("admin.jobs").toLowerCase()} total</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Briefcase size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{jobs.length}</p><p className="text-[11px] text-gray-500">{t("admin.totalUsers")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Clock size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{pendingList.length}</p><p className="text-[11px] text-gray-500">{t("status.pending")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{activeList.length}</p><p className="text-[11px] text-gray-500">{t("status.active")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600"><XCircle size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{jobs.filter(j => j.status === "rejected").length}</p><p className="text-[11px] text-gray-500">{t("status.rejected")}</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "pending", "active", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "all" ? t("admin.totalUsers") : f === "pending" ? t("status.pending") : f === "active" ? t("status.active") : t("status.rejected")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[28%]">{t("jobs.title")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[18%]">{t("jobs.location")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[12%]">{t("admin.status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[10%]"><Eye size={11} className="inline" /> {t("jobs.views")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[32%]">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(job => (
              <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 text-xs">{job.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{job.salary} · {job.duration}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    job.status === "pending" ? "bg-amber-100 text-amber-700" :
                    job.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    job.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}>{job.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.views || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {job.status === "pending" && (
                      <>
                        <button onClick={() => approve(job.id)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100"><CheckCircle size={11} className="inline mr-0.5" />{t("admin.approve")}</button>
                        <button onClick={() => reject(job.id)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-medium hover:bg-red-100"><XCircle size={11} className="inline mr-0.5" />{t("admin.reject")}</button>
                      </>
                    )}
                    <button onClick={() => remove(job.id)} className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] font-medium hover:bg-gray-100"><Trash2 size={11} className="inline mr-0.5" />{t("admin.remove")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
