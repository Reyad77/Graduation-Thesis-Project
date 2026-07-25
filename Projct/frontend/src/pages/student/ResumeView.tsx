import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import studentService from "@/services/studentService";
import type { Resume } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FileText, Award, Clock, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StudentResumeView() {
  const { t } = useTranslation(); const { id } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if(id) studentService.getResume(id).then(setResume).finally(()=>setIsLoading(false)); }, [id]);
  const handleDelete = async () => { if(!confirm("Delete?")) return; await studentService.deleteResume(id!); toast.success("Deleted"); window.history.back(); };

  if(isLoading) return <LoadingSpinner fullPage />;
  if(!resume) return <div className="text-center py-16">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("resume.preview")}</h1>
        <div className="flex gap-2">
          <Link to={`/student/resume/${id}/edit`} className="btn-secondary flex items-center gap-1"><Edit size={14}/> {t("common.edit")}</Link>
          <button onClick={handleDelete} className="btn-secondary !text-red-600"><Trash2 size={14}/></button>
        </div>
      </div>
      <div className="card space-y-4">
        <Section icon={<FileText size={16}/>} title="Details">
          <p className="text-sm"><strong>{t("profile.major")}:</strong> {resume.major}</p>
          <p className="text-sm"><strong>{t("profile.grade")}:</strong> {resume.grade}</p>
          <p className="text-sm"><strong>{t("resume.availableHours")}:</strong> {resume.availableHours}</p>
          {resume.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
        </Section>
        <Section icon={<Award size={16}/>} title={t("profile.skills")}>
          <div className="flex flex-wrap gap-1">{resume.skills.map(s=><span key={s} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>)}</div>
        </Section>
        <Section icon={<Clock size={16}/>} title={t("resume.experience")}>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{resume.experience}</p>
        </Section>
      </div>
    </div>
  );
}
function Section({ icon, title, children }: { icon:React.ReactNode; title:string; children:React.ReactNode }) {
  return <div><div className="flex items-center gap-2 text-gray-700 font-medium mb-2">{icon}{title}</div>{children}</div>;
}
