import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import adminService from "@/services/adminService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminJobAudit() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () => adminService.getAllJobs().then(j=>setJobs(Array.isArray(j)?j:[])).finally(()=>setIsLoading(false));
  useEffect(()=>{fetch();},[]);

  const approve = async (id:string) => { try{await adminService.approveJob(id); toast.success(t("admin.approvedToast")); fetch();}catch{toast.error(t("admin.failedToast"));} };
  const reject = async (id:string) => { const n=prompt(t("admin.reasonPrompt")); if(!n)return; try{await adminService.rejectJob(id,n); toast.success(t("admin.rejectedToast")); fetch();}catch{toast.error(t("admin.failedToast"));} };
  const remove = async (id:string) => { if(!confirm("Remove?"))return; await adminService.removeJob(id); toast.success(t("admin.removedToast")); fetch(); };

  if(isLoading) return <LoadingSpinner fullPage />;
  const pendingJobs = jobs.filter(j=>j.status==="pending");

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t("admin.auditTitle")}</h1>
      <p className="text-sm text-gray-500 mb-6">{pendingJobs.length} {t("admin.pending")} · {jobs.length} {t("admin.totalUsers").toLowerCase()}</p>
      <div className="space-y-2">
        {jobs.map(j=>(
          <div key={j.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{j.title} <span className={`text-xs px-2 py-0.5 rounded-full ${j.status==="pending"?"bg-yellow-100 text-yellow-700":j.status==="active"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{j.status}</span></p><p className="text-xs text-gray-500">{j.location} · {j.salary}</p></div>
            <div className="flex gap-1">
              {j.status==="pending" && <><button onClick={()=>approve(j.id)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700"><CheckCircle size={12} className="inline"/> {t("admin.approve")}</button><button onClick={()=>reject(j.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"><XCircle size={12} className="inline"/> {t("admin.reject")}</button></>}
              <button onClick={()=>remove(j.id)} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"><Trash2 size={12} className="inline"/> {t("admin.remove")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
