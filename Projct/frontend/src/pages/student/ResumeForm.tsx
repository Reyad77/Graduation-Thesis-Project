import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import studentService from "@/services/studentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function StudentResumeForm() {
  const { t } = useTranslation(); const { id } = useParams(); const navigate = useNavigate();
  const isEdit = !!id; const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ major:"", grade:"", skills:"", availableHours:"", experience:"" });

  useEffect(() => { if(!id) return;
    studentService.getResume(id).then(r => setForm({
      major:r.major||"", grade:r.grade||"", skills:(r.skills||[]).join(", "),
      availableHours:r.availableHours||"", experience:r.experience||"",
    })).catch(()=>toast.error("Load failed")).finally(()=>setIsLoading(false)); }, [id]);

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    const payload = { major:form.major, grade:form.grade, skills:form.skills.split(",").map(s=>s.trim()).filter(Boolean), availableHours:form.availableHours, experience:form.experience };
    try {
      if(isEdit) { await studentService.updateResume(id!, payload); toast.success("Resume updated!"); }
      else { await studentService.createResume(payload); toast.success("Resume created!"); }
      navigate("/student");
    } catch { toast.error("Failed to save"); }
    finally { setIsSaving(false); }
  };

  if(isLoading) return <LoadingSpinner fullPage />;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{isEdit?t("resume.edit"):t("resume.create")}</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("profile.major")}</label><input className="input-field" value={form.major} onChange={e=>setForm({...form,major:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("profile.grade")}</label><select className="input-field" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}><option value="">--</option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option></select></div>
          <div><label className="block text-sm font-medium mb-1">{t("resume.availableHours")}</label><input className="input-field" value={form.availableHours} onChange={e=>setForm({...form,availableHours:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("profile.skills")}</label><input className="input-field" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">{t("resume.experience")}</label><textarea className="input-field" rows={5} value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.save")}</button>
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">{t("common.cancel")}</button>
        </div>
      </form>
    </div>
  );
}
