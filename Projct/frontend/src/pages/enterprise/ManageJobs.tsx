import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Edit, Trash2, Pause, Play, Eye } from "lucide-react";
import enterpriseService from "@/services/enterpriseService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function ManageJobs() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = () => enterpriseService.getJobs().then(j=>setJobs(Array.isArray(j)?j:[])).finally(()=>setIsLoading(false));
  useEffect(() => { fetchJobs(); }, []);

  const handleStatus = async (id:string, status:string) => {
    try { await enterpriseService.updateJobStatus(id, status); toast.success(`Job ${status}`); fetchJobs(); }
    catch { toast.error("Failed"); }
  };
  const handleDelete = async (id:string) => {
    if(!confirm("Delete this job?")) return;
    await enterpriseService.deleteJob(id); toast.success("Deleted"); fetchJobs();
  };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("enterprise.manageJobs")}</h1>
        <Link to="/enterprise/post-job" className="btn-primary">{t("enterprise.postJob")}</Link>
      </div>
      {jobs.length===0 ? <p className="text-gray-500">{t("jobs.noJobs")}</p> : (
        <div className="space-y-3">
          {jobs.map(j=>(
            <div key={j.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{j.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{j.location} · {j.salary} · {j.workingHours}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    j.status==="active"?"bg-green-100 text-green-700":j.status==="pending"?"bg-yellow-100 text-yellow-700":j.status==="paused"?"bg-gray-100 text-gray-600":"bg-red-100 text-red-700"}`}>{j.status}</span>
                  <span className="text-xs text-gray-400"><Eye size={12} className="inline"/> {j.views} · {j.applicationsCount||0} apps</span>
                </div>
              </div>
              <div className="flex gap-1">
                {j.status==="active" && <button onClick={()=>handleStatus(j.id,"paused")} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Pause"><Pause size={14}/></button>}
                {j.status==="paused" && <button onClick={()=>handleStatus(j.id,"active")} className="p-2 rounded hover:bg-gray-100 text-green-600" title="Activate"><Play size={14}/></button>}
                <Link to={`/enterprise/post-job?edit=${j.id}`} className="p-2 rounded hover:bg-gray-100 text-blue-600"><Edit size={14}/></Link>
                <button onClick={()=>handleDelete(j.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
