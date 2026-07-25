import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Briefcase, Users, Eye, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import enterpriseService from "@/services/enterpriseService";
import type { Job, Enterprise } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EnterpriseDashboard() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Enterprise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      enterpriseService.getJobs().then(j => setJobs(Array.isArray(j)?j:[])),
      enterpriseService.getProfile().then(p => setProfile(p)).catch(() => null),
    ]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  const isPendingApproval = profile && !profile.isApproved;
  const needsProfile = !profile;

  // ── No profile yet ──────────────────────────────────────────
  if (needsProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
        <div className="card mt-6 text-center">
          <AlertTriangle size={40} className="text-yellow-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-800 mb-2">Complete Your Company Profile</p>
          <p className="text-sm text-gray-500 mb-4">
            Before posting jobs, you need to set up your company details for admin approval.
          </p>
          <Link to="/enterprise/register" className="btn-primary">Complete Profile</Link>
        </div>
      </div>
    );
  }

  const active = jobs.filter(j => j.status === "active").length;
  const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0);
  const totalApps = jobs.reduce((s, j) => s + (j.applicationsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>

      {/* ── Pending Approval Banner ──────────────────────────── */}
      {isPendingApproval && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Admin Approval Pending</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Your company profile is awaiting admin verification. You won't be able to post jobs until approved.
            </p>
          </div>
        </div>
      )}

      {/* ── Approved Badge ───────────────────────────────────── */}
      {profile.isApproved && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <ShieldCheck size={18} className="text-green-600" />
          <p className="text-sm font-medium text-green-800">Company Verified & Approved</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<Briefcase size={20} />} label="Total Jobs" value={jobs.length} color="bg-blue-100 text-blue-700" />
        <StatCard icon={<Briefcase size={20} />} label="Active" value={active} color="bg-green-100 text-green-700" />
        <StatCard icon={<Eye size={20} />} label="Total Views" value={totalViews} color="bg-purple-100 text-purple-700" />
        <StatCard icon={<Users size={20} />} label="Applications" value={totalApps} color="bg-yellow-100 text-yellow-700" />
      </div>

      <div className="flex gap-3 mt-8">
        {profile.isApproved ? (
          <Link to="/enterprise/post-job" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> {t("enterprise.postJob")}
          </Link>
        ) : (
          <button disabled className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed" title="Awaiting admin approval">
            <Plus size={16} /> {t("enterprise.postJob")} (Pending Approval)
          </button>
        )}
        <Link to="/enterprise/jobs" className="btn-secondary">{t("enterprise.manageJobs")}</Link>
        <Link to="/enterprise/applicants" className="btn-secondary flex items-center gap-2">
          <Users size={16} /> {t("enterprise.applicants")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recent Jobs</h2>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs posted yet.</p>
          ) : (
            jobs.slice(0, 5).map(j => (
              <div key={j.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{j.title}</p>
                  <p className="text-xs text-gray-500">{j.location} · {j.status}</p>
                </div>
                <span className="text-xs text-gray-500">{j.applicationsCount || 0} applicants</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
