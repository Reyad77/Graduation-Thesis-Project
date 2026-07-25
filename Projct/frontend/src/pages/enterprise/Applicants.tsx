import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import enterpriseService from "@/services/enterpriseService";
import type { Application } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from "@/utils/constants";
import { toast } from "react-hot-toast";

export default function EnterpriseApplicants() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInterview, setShowInterview] = useState<string|null>(null);
  const [interviewForm, setInterviewForm] = useState({ date:"", location:"", notes:"" });

  const fetch = () => enterpriseService.getAllApplications().then(a=>setApps(Array.isArray(a)?a:[])).finally(()=>setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id:string, status:string) => {
    try { await enterpriseService.updateApplicationStatus(id, status); toast.success(`Status: ${status}`); fetch(); }
    catch { toast.error("Failed"); }
  };
  const scheduleInterview = async (id:string) => {
    try { await enterpriseService.scheduleInterview(id, interviewForm); toast.success("Interview scheduled"); setShowInterview(null); fetch(); }
    catch { toast.error("Failed"); }
  };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.applicants")}</h1>
      {apps.length===0 ? <p className="text-gray-500 mt-4">{t("common.noData")}</p> : (
        <div className="mt-6 space-y-3">
          {apps.map(app=>(
            <div key={app.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Applicant for Job #{app.jobId.slice(0,8)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Applied: {app.appliedAt?.slice(0,10)} · Resume: #{app.resumeId.slice(0,8)}</p>
                {app.interviewSchedule?.date && <p className="text-xs text-purple-600 mt-0.5"><Calendar size={12} className="inline"/> Interview: {app.interviewSchedule.date.slice(0,10)} at {app.interviewSchedule.location}</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPLICATION_STATUS_COLORS[app.status]||""}`}>{APPLICATION_STATUS_LABELS[app.status]||app.status}</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {app.status==="pending" && <><button onClick={()=>updateStatus(app.id,"reviewing")} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"><Eye size={12} className="inline"/> Reviewing</button></>}
                {app.status==="reviewing" && <><button onClick={()=>setShowInterview(app.id)} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"><Calendar size={12} className="inline"/> Interview</button></>}
                {app.status==="interview" && <><button onClick={()=>updateStatus(app.id,"hired")} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={12} className="inline"/> Hire</button><button onClick={()=>updateStatus(app.id,"rejected")} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={12} className="inline"/> Reject</button></>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview modal */}
      {showInterview && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={()=>setShowInterview(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Schedule Interview</h3>
            <div className="space-y-3">
              <div><label className="block text-sm mb-1">Date</label><input type="datetime-local" className="input-field" value={interviewForm.date} onChange={e=>setInterviewForm({...interviewForm,date:e.target.value})}/></div>
              <div><label className="block text-sm mb-1">Location</label><input className="input-field" value={interviewForm.location} onChange={e=>setInterviewForm({...interviewForm,location:e.target.value})}/></div>
              <div><label className="block text-sm mb-1">Notes</label><input className="input-field" value={interviewForm.notes} onChange={e=>setInterviewForm({...interviewForm,notes:e.target.value})}/></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>scheduleInterview(showInterview)} className="btn-primary text-sm">Schedule</button>
              <button onClick={()=>setShowInterview(null)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
