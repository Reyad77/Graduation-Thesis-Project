import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Briefcase, CheckCircle, Clock,
  UserCheck, Building2, Search, Megaphone, Image, ArrowRight, RefreshCw, XCircle,
} from "lucide-react";
import adminService from "@/services/adminService";
import { useAuth } from "@/hooks/useAuth";
import type { User, Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      adminService.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])),
      adminService.getPendingJobs().then(j => setPendingJobs(Array.isArray(j) ? j : [])),
    ]).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproveJob = async (id: string) => {
    try { await adminService.approveJob(id); toast.success("Job approved"); fetchData(); }
    catch { toast.error("Failed"); }
  };
  const handleRejectJob = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try { await adminService.rejectJob(id, reason); toast.success("Job rejected"); fetchData(); }
    catch { toast.error("Failed"); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const students = users.filter(u => u.role === "student");
  const enterprises = users.filter(u => u.role === "enterprise");
  const unverifiedStudents = students.filter(u => u.isActive).length;
  const unapprovedEnterprises = enterprises.filter(u => u.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.displayName || "Admin"} — manage the platform from here.
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-1 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stats Overview ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Users" value={users.length} color="bg-blue-500" href="/admin/users" />
        <StatCard icon={<UserCheck size={22} />} label="Students" value={students.length} subtitle={`${unverifiedStudents} to verify`} color="bg-emerald-500" href="/admin/verify-students" />
        <StatCard icon={<Building2 size={22} />} label="Enterprises" value={enterprises.length} subtitle={`${unapprovedEnterprises} to approve`} color="bg-violet-500" href="/admin/approve-enterprises" />
        <StatCard icon={<Clock size={22} />} label="Pending Jobs" value={pendingJobs.length} subtitle="Awaiting review" color="bg-amber-500" href="/admin/jobs" />
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">

        {/* ── Pending Jobs (wider column) ─────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Pending Job Approvals
              {pendingJobs.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingJobs.length}</span>
              )}
            </h2>
            <Link to="/admin/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="card text-center py-10">
              <CheckCircle size={36} className="text-green-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No pending jobs — everything's reviewed!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingJobs.slice(0, 6).map(job => (
                <div key={job.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.salary}</span>
                      <span>{job.duration}</span>
                      <span className="text-gray-400">{job.postedAt?.slice(0, 10)}</span>
                    </div>
                    {job.skillRequirements?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skillRequirements.map(s => (
                          <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveJob(job.id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectJob(job.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Actions ────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search size={18} className="text-primary-500" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <ActionCard
              icon={<UserCheck size={18} />}
              title="Verify Students"
              desc={`${unverifiedStudents} student(s)`}
              to="/admin/verify-students"
              color="text-emerald-600 bg-emerald-50"
            />
            <ActionCard
              icon={<Building2 size={18} />}
              title="Approve Enterprises"
              desc={`${unapprovedEnterprises} enterprise(s)`}
              to="/admin/approve-enterprises"
              color="text-violet-600 bg-violet-50"
            />
            <ActionCard
              icon={<Briefcase size={18} />}
              title="Audit Jobs"
              desc={`${pendingJobs.length} pending`}
              to="/admin/jobs"
              color="text-amber-600 bg-amber-50"
            />
            <ActionCard
              icon={<Users size={18} />}
              title="User Management"
              desc={`${users.length} total users`}
              to="/admin/users"
              color="text-blue-600 bg-blue-50"
            />
            <ActionCard
              icon={<Megaphone size={18} />}
              title="Announcements"
              desc="Manage articles & news"
              to="/admin/announcements"
              color="text-pink-600 bg-pink-50"
            />
            <ActionCard
              icon={<Image size={18} />}
              title="Banners"
              desc="Homepage carousel"
              to="/admin/banners"
              color="text-indigo-600 bg-indigo-50"
            />
          </div>
        </div>
      </div>

      {/* ── Recent Users ───────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            Recent Users
          </h2>
          <Link to="/admin/users" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(u => (
                <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.displayName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "enterprise" ? "bg-violet-100 text-violet-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>{u.isActive ? "Active" : "Banned"}</span>
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

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, subtitle, color, href }: {
  icon: React.ReactNode; label: string; value: number; subtitle?: string;
  color: string; href: string;
}) {
  return (
    <Link to={href} className="card group hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color} text-white`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );
}

// ── Action Card ────────────────────────────────────────────────────────
function ActionCard({ icon, title, desc, to, color }: {
  icon: React.ReactNode; title: string; desc: string; to: string; color: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group"
    >
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}
