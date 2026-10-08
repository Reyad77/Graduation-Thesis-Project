import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import studentService from "@/services/studentService";
import evaluationService from "@/services/evaluationService";
import type { Application } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EvaluateModal from "@/components/evaluation/EvaluateModal";
import { Clock, CheckCircle, XCircle, Eye, Calendar, Star } from "lucide-react";
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from "@/utils/constants";

export default function StudentApplications() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvaluate, setShowEvaluate] = useState<string | null>(null);
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    studentService.getApplications()
      .then(a => setApps(Array.isArray(a)?a:[]))
      .finally(()=>setIsLoading(false));
    // Which applications have I already evaluated?
    evaluationService.getReceived()
      .then(list => setEvaluatedIds(new Set((list || []).map((e: { applicationId: string }) => e.applicationId))))
      .catch(() => {});
  }, []);

  if(isLoading) return <LoadingSpinner fullPage />;

  const criteria = [t("evaluation.criteriaRecruiter1"), t("evaluation.criteriaRecruiter2"), t("evaluation.criteriaRecruiter3")];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("nav.myApps")}</h1>
      {apps.length===0 ? <p className="text-gray-500 mt-4">{t("common.noData")}</p> : (
        <div className="mt-6 space-y-3">
          {apps.map(app=>(
            <div key={app.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Job #{app.jobId.slice(0,8)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <Calendar size={12} className="inline mr-1"/>{app.appliedAt?.slice(0,10)}
                  {app.interviewSchedule?.date && <span className="ml-3"><Eye size={12} className="inline mr-1"/>Interview: {app.interviewSchedule.date.slice(0,10)}</span>}
                </p>
                {app.notes && <p className="text-xs text-gray-500 mt-0.5">Note: {app.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                {app.status==="hired"?<CheckCircle size={14} className="text-green-600"/>:
                 app.status==="rejected"?<XCircle size={14} className="text-red-600"/>:
                 <Clock size={14} className="text-yellow-600"/>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPLICATION_STATUS_COLORS[app.status]||""}`}>
                  {APPLICATION_STATUS_LABELS[app.status]||app.status}
                </span>
                {app.status==="completed" && !evaluatedIds.has(app.id) && (
                  <button onClick={()=>setShowEvaluate(app.id)}
                    className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-1">
                    <Star size={12} /> {t("evaluation.evaluate")}
                  </button>
                )}
                {app.status==="completed" && evaluatedIds.has(app.id) && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500">{t("evaluation.evaluated")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showEvaluate && (
        <EvaluateModal
          applicationId={showEvaluate}
          criteria={criteria}
          onClose={()=>setShowEvaluate(null)}
          onSubmitted={()=>setEvaluatedIds(prev => new Set(prev).add(showEvaluate))}
        />
      )}
    </div>
  );
}
