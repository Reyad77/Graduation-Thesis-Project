import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Briefcase, FileText, Clock, CheckCircle, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import studentService from "@/services/studentService";
import type { Job, Application, Student } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function StudentDashboard() {
  const { t } = useTranslation();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [jobsRes, appsRes, prof] = await Promise.all([
          studentService.getJobs({ page_size: 4 }),
          studentService.getApplications(),
          studentService.getProfile().catch(() => null),
        ]);
        setRecentJobs(Array.isArray(jobsRes) ? jobsRes.slice(0,4) : []);
        setApplications(Array.isArray(appsRes) ? appsRes : []);
        setProfile(prof);
      } catch { /* best-effort */ } finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  const needsVerification = profile && !profile.isVerified;
  const needsProfileCompletion = !profile || !profile.major;

  const statusCounts = applications.reduce((acc: Record<string,number>, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("navigation.dashboard")}</h1>

      {/* Verification / Profile completion banners */}
      {needsVerification && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Identity Verification Pending</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Your student ID is awaiting admin verification. You can browse jobs but some features may be limited.
            </p>
            <Link to="/student/profile" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              Complete your profile →
            </Link>
          </div>
        </div>
      )}

      {needsProfileCompletion && !needsVerification && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <FileText size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Complete Your Profile</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Add your major, skills, and availability to get better job recommendations.
            </p>
            <Link to="/student/profile" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              Set up profile →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<Briefcase size={20} />} label="Applications" value={applications.length} color="bg-blue-100 text-blue-700" />
        <StatCard icon={<CheckCircle size={20} />} label="Hired" value={statusCounts.hired || 0} color="bg-green-100 text-green-700" />
        <StatCard icon={<Clock size={20} />} label="Pending" value={(statusCounts.pending||0)+(statusCounts.reviewing||0)} color="bg-yellow-100 text-yellow-700" />
        <StatCard icon={<FileText size={20} />} label="Resumes" value="--" color="bg-purple-100 text-purple-700" />
      </div>
      <div className="flex gap-3 mt-8">
        <Link to="/jobs" className="btn-primary flex items-center gap-2"><Briefcase size={16} /> {t("navigation.jobs")}</Link>
        <Link to="/student/resume/new" className="btn-secondary flex items-center gap-2"><Plus size={16} /> {t("resume.create")}</Link>
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Applications</h2>
        {applications.length === 0 ? <p className="text-gray-500 text-sm">{t("common.noData")}</p> : (
          <div className="space-y-2">
            {applications.slice(0,5).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div><p className="text-sm font-medium">Job #{app.jobId.slice(0,8)}</p><p className="text-xs text-gray-500">{app.appliedAt?.slice(0,10)}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  app.status==="hired"?"bg-green-100 text-green-700":app.status==="rejected"?"bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>{app.status}</span>
              </div>
            ))}
            <Link to="/applications" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">{t("common.viewAll")} <ChevronRight size={14} /></Link>
          </div>
        )}
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Jobs</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {recentJobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block p-4 bg-white rounded-lg border hover:border-primary-300 transition-colors">
              <p className="font-medium text-gray-900 text-sm">{job.title}</p>
              <p className="text-xs text-gray-500 mt-1">{job.location} · {job.salary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon:React.ReactNode; label:string; value:number|string; color:string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
    </div>
  );
}
