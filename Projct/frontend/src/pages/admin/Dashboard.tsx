import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users, UserCheck, Building2, Briefcase, Clock,
  CheckCircle, ArrowRight, Megaphone, Image, RefreshCw,
} from "lucide-react";
import adminService from "@/services/adminService";
import type { User, Job } from "@/types";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      adminService.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])),
      adminService.getPendingJobs().then(j => setPendingJobs(Array.isArray(j) ? j : [])),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => {
    try { await adminService.approveJob(id); toast.success(t("admin.approvedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); }
  };
  const reject = async (id: string) => {
    const r = prompt(t("admin.reasonPrompt")); if (!r) return;
    try { await adminService.rejectJob(id, r); toast.success(t("admin.rejectedToast")); fetch(); } catch { toast.error(t("admin.failedToast")); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  const totalStudents = users.filter(u => u.role === "student").length;
  const totalEnterprises = users.filter(u => u.role === "enterprise").length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{t("admin.controlPanel")}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("admin.welcome")}, <span className="text-gray-800 font-medium">{t("admin.platformAdmin")}</span>
          </p>
        </div>
        <button onClick={fetch} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors">
          <RefreshCw size={13} /> {t("common.refresh")}
        </button>
      </div>

      {/* ── 4 Stat Cards — equal size, equal gap ──────────── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label={t("admin.totalUsers")} value={users.length}
          bg="bg-blue-50" iconColor="text-blue-600" to="/admin/users" />
        <StatCard icon={<UserCheck size={18} />} label={t("admin.students")} value={totalStudents}
          bg="bg-emerald-50" iconColor="text-emerald-600" to="/admin/verify-students" />
        <StatCard icon={<Building2 size={18} />} label={t("admin.enterprises")} value={totalEnterprises}
          bg="bg-violet-50" iconColor="text-violet-600" to="/admin/approve-enterprises" />
        <StatCard icon={<Clock size={18} />} label={t("admin.pendingJobs")} value={pendingJobs.length}
          bg="bg-amber-50" iconColor="text-amber-600" to="/admin/jobs" pulse={pendingJobs.length > 0} />
      </div>

      {/* ── Two equal columns ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Pending Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              {t("admin.pendingApprovals")}
              {pendingJobs.length > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  {pendingJobs.length}
                </span>
              )}
            </h2>
            <Link to="/admin/jobs" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              {t("admin.allJobs")} <ArrowRight size={11} />
            </Link>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
            {pendingJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle size={28} className="text-emerald-300 mb-2" />
                <p className="text-xs text-gray-400">{t("admin.allClear")}</p>
              </div>
            ) : (
              pendingJobs.map(job => (
                <div key={job.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 flex items-center justify-between hover:border-primary-200 hover:shadow-sm transition-all">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm text-gray-800 font-medium truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.location} · {job.salary} · {job.duration}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => approve(job.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-medium hover:bg-emerald-100 border border-emerald-200 transition-all">
                      {t("common.approve")}
                    </button>
                    <button onClick={() => reject(job.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-[11px] font-medium hover:bg-red-100 border border-red-200 transition-all">
                      {t("common.reject")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t("admin.quickActions")}</h2>
          <div className="flex-1 grid grid-cols-2 gap-3 content-start">
            <ActionTile to="/admin/verify-students" icon={<UserCheck size={20} />}
              label={t("admin.verifyStudents")} sub={`${totalStudents} ${t("admin.total")}`} color="emerald" />
            <ActionTile to="/admin/approve-enterprises" icon={<Building2 size={20} />}
              label={t("admin.approveHR")} sub={`${totalEnterprises} ${t("admin.total")}`} color="violet" />
            <ActionTile to="/admin/jobs" icon={<Briefcase size={20} />}
              label={t("admin.auditJobs")} sub={`${pendingJobs.length} ${t("admin.pending")}`} color="amber" />
            <ActionTile to="/admin/users" icon={<Users size={20} />}
              label={t("admin.userManagement")} sub={`${users.length} ${t("admin.total")}`} color="blue" />
            <ActionTile to="/admin/announcements" icon={<Megaphone size={20} />}
              label={t("admin.news")} sub={t("admin.announcement")} color="pink" />
            <ActionTile to="/admin/banners" icon={<Image size={20} />}
              label={t("admin.media")} sub={t("admin.media")} color="indigo" />
          </div>
        </div>
      </div>

      {/* ── User table — full width ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">{t("admin.recentUsers")}</h2>
          <Link to="/admin/users" className="text-xs text-primary-600 hover:underline">{t("common.viewAll")}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs">{t("admin.name")}</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs">{t("admin.email")}</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs">{t("admin.role")}</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs">{t("admin.status")}</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 6).map(u => (
                <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 text-gray-800 font-medium">{u.displayName}</td>
                  <td className="py-2.5 px-3 text-gray-500">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "enterprise" ? "bg-violet-100 text-violet-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-medium ${u.isActive ? "text-emerald-600" : "text-red-600"}`}>
                      {u.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, iconColor, to, pulse }: {
  icon: React.ReactNode; label: string; value: number; bg: string; iconColor: string; to: string; pulse?: boolean;
}) {
  return (
    <Link to={to} className={`rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all relative`}>
      {pulse && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      )}
      <div className={`p-2.5 rounded-xl ${bg} ${iconColor} shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function ActionTile({ to, icon, label, sub, color }: {
  to: string; icon: React.ReactNode; label: string; sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300",
    violet: "border-violet-200 bg-violet-50 text-violet-600 hover:border-violet-300",
    amber: "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300",
    blue: "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300",
    pink: "border-pink-200 bg-pink-50 text-pink-600 hover:border-pink-300",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-600 hover:border-indigo-300",
  };
  return (
    <Link to={to}
      className={`rounded-xl border ${colors[color]} p-4 flex flex-col items-center justify-center gap-2 text-center hover:shadow-sm transition-all`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </Link>
  );
}
