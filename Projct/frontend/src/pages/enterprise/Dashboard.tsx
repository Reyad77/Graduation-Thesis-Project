import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Briefcase, Users, Eye, Plus } from "lucide-react";
import enterpriseService from "@/services/enterpriseService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EnterpriseDashboard() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    enterpriseService.getJobs()
      .then(j => setJobs(Array.isArray(j)?j:[]))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
        <div className="card mt-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure your enterprise profile is set up. If you just registered, complete your company profile first.
          </p>
          <Link to="/enterprise/register" className="btn-primary">Complete Profile</Link>
        </div>
      </div>
    );
  }

  const active = jobs.filter(j=>j.status==="active").length;
  const totalViews = jobs.reduce((s,j)=>s+(j.views||0), 0);
  const totalApps = jobs.reduce((s,j)=>s+(j.applicationsCount||0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<Briefcase size={20}/>} label="Total Jobs" value={jobs.length} color="bg-blue-100 text-blue-700"/>
        <StatCard icon={<Briefcase size={20}/>} label="Active" value={active} color="bg-green-100 text-green-700"/>
        <StatCard icon={<Eye size={20}/>} label="Total Views" value={totalViews} color="bg-purple-100 text-purple-700"/>
        <StatCard icon={<Users size={20}/>} label="Applications" value={totalApps} color="bg-yellow-100 text-yellow-700"/>
      </div>
      <div className="flex gap-3 mt-8">
        <Link to="/enterprise/post-job" className="btn-primary flex items-center gap-2"><Plus size={16}/> {t("enterprise.postJob")}</Link>
        <Link to="/enterprise/jobs" className="btn-secondary">{t("enterprise.manageJobs")}</Link>
        <Link to="/enterprise/applicants" className="btn-secondary flex items-center gap-2"><Users size={16}/> {t("enterprise.applicants")}</Link>
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recent Jobs</h2>
        <div className="space-y-2">
          {jobs.slice(0,5).map(j=>(
            <div key={j.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div><p className="text-sm font-medium">{j.title}</p>
                <p className="text-xs text-gray-500">{j.location} · {j.status}</p></div>
              <span className="text-xs text-gray-500">{j.applicationsCount||0} applicants</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function StatCard({ icon, label, value, color }: { icon:React.ReactNode; label:string; value:number; color:string }) {
  return <div className="card flex items-center gap-3"><div className={`p-2 rounded-lg ${color}`}>{icon}</div><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500">{label}</p></div></div>;
}
