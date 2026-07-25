import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { DollarSign, MapPin, Clock, Calendar, ArrowLeft } from "lucide-react";
import studentService from "@/services/studentService";
import { useAuth } from "@/hooks/useAuth";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function JobDetail() {
  const { t } = useTranslation(); const { id } = useParams();
  const { isAuthenticated, role } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedResume, setSelectedResume] = useState("");
  const [resumes, setResumes] = useState<{id:string}[]>([]);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if(!id) return;
    studentService.getJob(id).then(async j => {
      setJob(j);
      if(isAuthenticated && role==="student") {
        try { const r = await studentService.getResumes(); setResumes(Array.isArray(r)?r:[]); } catch {}
        try { const c = await api_check(id!); setHasApplied(c.applied); } catch {}
      }
    }).finally(()=>setIsLoading(false));
  }, [id, isAuthenticated, role]);

  const handleApply = async () => {
    if(!selectedResume) { toast.error("Select a resume first"); return; }
    setIsApplying(true);
    try { await studentService.applyToJob(id!, selectedResume); setHasApplied(true); toast.success("Applied!"); }
    catch { toast.error("Failed to apply"); }
    finally { setIsApplying(false); }
  };

  if(isLoading) return <LoadingSpinner fullPage />;
  if(!job) return <div className="text-center py-16">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="flex items-center gap-1 text-sm text-primary-600 hover:underline mb-4"><ArrowLeft size={14}/> {t("common.back")}</Link>
      <div className="card">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600"><DollarSign size={16} className="text-green-600"/> {job.salary}</div>
          <div className="flex items-center gap-1 text-gray-600"><MapPin size={16} className="text-red-500"/> {job.location}</div>
          <div className="flex items-center gap-1 text-gray-600"><Clock size={16} className="text-blue-500"/> {job.workingHours}</div>
          <div className="flex items-center gap-1 text-gray-600"><Calendar size={16} className="text-purple-500"/> {job.duration}</div>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold text-gray-800">{t("jobs.responsibilities")}</h2>
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{job.responsibilities}</p>
        </div>
        <div className="mt-4">
          <h2 className="font-semibold text-gray-800">{t("jobs.skillRequirements")}</h2>
          <div className="flex flex-wrap gap-1 mt-1">{job.skillRequirements.map(s=><span key={s} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>)}</div>
        </div>

        {/* Apply section */}
        <div className="mt-6 pt-6 border-t">
          {!isAuthenticated ? (
            <Link to="/login" className="btn-primary">{t("auth.login")} {t("jobs.apply")}</Link>
          ) : role!=="student" ? (
            <p className="text-sm text-gray-500">Only students can apply.</p>
          ) : hasApplied ? (
            <p className="text-green-600 font-medium">You have applied to this job.</p>
          ) : (
            <div className="space-y-3">
              <select className="input-field" value={selectedResume}
                onChange={e=>setSelectedResume(e.target.value)}>
                <option value="">Select a resume</option>
                {resumes.map(r=><option key={r.id} value={r.id}>Resume #{r.id.slice(0,8)}</option>)}
              </select>
              <button onClick={handleApply} disabled={isApplying||!selectedResume} className="btn-primary">
                {isApplying?t("common.loading"):t("jobs.apply")}
              </button>
              {resumes.length===0&&<p className="text-xs text-gray-500"><Link to="/student/resume/new" className="text-primary-600">Create a resume</Link> first.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import api from "@/services/api";
async function api_check(jobId:string) { const { data } = await api.get(`/jobs/${jobId}/check-application`); return data; }
