import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import studentService from "@/services/studentService";
import type { ExperienceEntry, ProjectEntry, LanguageEntry } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

const emptyExp = (): ExperienceEntry => ({ title: "", company: "", startDate: "", endDate: "", description: "" });
const emptyProject = (): ProjectEntry => ({ name: "", description: "", link: "" });
const emptyLang = (): LanguageEntry => ({ language: "", level: "Fluent" });

export default function StudentResumeForm() {
  const { t } = useTranslation(); const { id } = useParams(); const navigate = useNavigate();
  const isEdit = !!id; const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newCert, setNewCert] = useState("");
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(isEdit ? [] : []);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [form, setForm] = useState({ summary:"", university:"", major:"", grade:"", skills:"", availableHours:"", experience:"" });

  useEffect(() => { if(!id) return;
    studentService.getResume(id).then(r => {
      setForm({
        summary: r.summary || "", university: r.university || "", major: r.major || "", grade: r.grade || "",
        skills: (r.skills || []).join(", "), availableHours: r.availableHours || "", experience: r.experience || "",
      });
      setCertificates(r.certificates || []);
      setResumeFile(r.resumeFile || "");
      setResumeFileName(r.resumeFileName || "");
      setExperiences(r.experiences?.length ? r.experiences : []);
      setProjects(r.projects || []);
      setLanguages(r.languages || []);
    }).catch(()=>toast.error("Load failed")).finally(()=>setIsLoading(false)); }, [id]);

  const handleAddCert = async () => {
    if (!id || !newCert.trim()) return;
    try {
      await studentService.addCertificate(id, newCert.trim());
      setCertificates(prev => [...prev, newCert.trim()]);
      setNewCert("");
      toast.success(t("resume.certAdded"));
    } catch { toast.error(t("resume.saveFailed")); }
  };

  const handleUploadFile = async (file: File) => {
    if (!id) return;
    setIsUploading(true);
    try {
      const res = await studentService.uploadResumeFile(id, file);
      setResumeFile(res.resumeFile);
      setResumeFileName(file.name);
      toast.success(t("resume.uploadSuccess"));
    } catch { toast.error(t("resume.uploadFailed")); }
    finally { setIsUploading(false); }
  };

  const handleRemoveFile = async () => {
    if (!id) return;
    try {
      await studentService.deleteResumeFile(id);
      setResumeFile(""); setResumeFileName("");
      toast.success(t("resume.fileRemoved"));
    } catch { toast.error(t("resume.saveFailed")); }
  };

  const handleRemoveCert = async (certUrl: string) => {
    if (!id) return;
    try {
      await studentService.removeCertificate(id, certUrl);
      setCertificates(prev => prev.filter(c => c !== certUrl));
      toast.success(t("resume.certRemoved"));
    } catch { toast.error(t("resume.saveFailed")); }
  };

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    const payload = {
      summary: form.summary, university: form.university,
      major: form.major, grade: form.grade,
      skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
      availableHours: form.availableHours, experience: form.experience,
      experiences: experiences.filter(x => x.title || x.company),
      projects: projects.filter(p => p.name),
      languages: languages.filter(l => l.language),
    };
    try {
      if(isEdit) { await studentService.updateResume(id!, payload); toast.success("Resume updated!"); navigate(`/student/resume/${id}`); }
      else { await studentService.createResume(payload); toast.success("Resume created!"); navigate("/student"); }
    } catch { toast.error("Failed to save"); }
    finally { setIsSaving(false); }
  };

  if(isLoading) return <LoadingSpinner fullPage />;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{isEdit?t("resume.edit"):t("resume.create")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">

        {/* Summary */}
        <div className="card space-y-4">
          <h2 className="font-semibold">{t("resume.summary")}</h2>
          <textarea className="input-field" rows={3} placeholder={t("resume.summaryPlaceholder")}
            value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} />
        </div>

        {/* Education */}
        <div className="card space-y-4">
          <h2 className="font-semibold">{t("resume.education")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{t("resume.university")}</label>
              <input className="input-field" value={form.university} onChange={e=>setForm({...form,university:e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">{t("profile.major")}</label>
              <input className="input-field" value={form.major} onChange={e=>setForm({...form,major:e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">{t("profile.grade")}</label>
              <select className="input-field" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>
                <option value="">--</option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option></select></div>
            <div><label className="block text-sm font-medium mb-1">{t("resume.availableHours")}</label>
              <input className="input-field" value={form.availableHours} onChange={e=>setForm({...form,availableHours:e.target.value})} /></div>
          </div>
        </div>

        {/* Work experience */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("resume.workExperience")}</h2>
            <button type="button" onClick={()=>setExperiences([...experiences, emptyExp()])}
              className="btn-secondary text-xs flex items-center gap-1"><Plus size={12}/> {t("resume.addExperience")}</button>
          </div>
          {experiences.map((x, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
              <button type="button" onClick={()=>setExperiences(experiences.filter((_,j)=>j!==i))}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              <div className="grid md:grid-cols-2 gap-2">
                <input className="input-field" placeholder={t("resume.expTitle")} value={x.title} onChange={e=>{const n=[...experiences];n[i]={...x,title:e.target.value};setExperiences(n);}} />
                <input className="input-field" placeholder={t("resume.company")} value={x.company} onChange={e=>{const n=[...experiences];n[i]={...x,company:e.target.value};setExperiences(n);}} />
                <input className="input-field" type="month" placeholder={t("resume.startDate")} value={x.startDate} onChange={e=>{const n=[...experiences];n[i]={...x,startDate:e.target.value};setExperiences(n);}} />
                <input className="input-field" type="month" placeholder={t("resume.endDate")} value={x.endDate} onChange={e=>{const n=[...experiences];n[i]={...x,endDate:e.target.value};setExperiences(n);}} />
              </div>
              <textarea className="input-field" rows={2} placeholder={t("resume.expDescription")} value={x.description} onChange={e=>{const n=[...experiences];n[i]={...x,description:e.target.value};setExperiences(n);}} />
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("resume.projects")}</h2>
            <button type="button" onClick={()=>setProjects([...projects, emptyProject()])}
              className="btn-secondary text-xs flex items-center gap-1"><Plus size={12}/> {t("resume.addProject")}</button>
          </div>
          {projects.map((p, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
              <button type="button" onClick={()=>setProjects(projects.filter((_,j)=>j!==i))}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              <div className="grid md:grid-cols-2 gap-2">
                <input className="input-field" placeholder={t("resume.projectName")} value={p.name} onChange={e=>{const n=[...projects];n[i]={...p,name:e.target.value};setProjects(n);}} />
                <input className="input-field" placeholder={t("resume.projectLink")} value={p.link} onChange={e=>{const n=[...projects];n[i]={...p,link:e.target.value};setProjects(n);}} />
              </div>
              <textarea className="input-field" rows={2} placeholder={t("resume.projectDesc")} value={p.description} onChange={e=>{const n=[...projects];n[i]={...p,description:e.target.value};setProjects(n);}} />
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("resume.languages")}</h2>
            <button type="button" onClick={()=>setLanguages([...languages, emptyLang()])}
              className="btn-secondary text-xs flex items-center gap-1"><Plus size={12}/> {t("resume.addLanguage")}</button>
          </div>
          {languages.map((l, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input-field flex-1" placeholder={t("resume.language")} value={l.language} onChange={e=>{const n=[...languages];n[i]={...l,language:e.target.value};setLanguages(n);}} />
              <select className="input-field w-40" value={l.level} onChange={e=>{const n=[...languages];n[i]={...l,level:e.target.value};setLanguages(n);}}>
                <option value="Basic">{t("resume.levelBasic")}</option>
                <option value="Conversational">{t("resume.levelConversational")}</option>
                <option value="Fluent">{t("resume.levelFluent")}</option>
                <option value="Native">{t("resume.levelNative")}</option>
              </select>
              <button type="button" onClick={()=>setLanguages(languages.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>

        {/* Skills & experience text */}
        <div className="card space-y-4">
          <h2 className="font-semibold">{t("resume.skillsAndMore")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{t("profile.skills")}</label>
              <input className="input-field" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="Python, JavaScript (comma-separated)" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">{t("resume.experience")}</label>
            <textarea className="input-field" rows={3} value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} /></div>
        </div>

        {/* Resume file upload (edit mode) */}
        {isEdit && (
          <div className="card space-y-2">
            <h2 className="font-semibold">{t("resume.uploadFile")}</h2>
            {resumeFile ? (
              <div className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                <a href={resumeFile} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline truncate">
                  {resumeFileName || t("resume.attachedFile")}
                </a>
                <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:underline ml-2 shrink-0">{t("common.delete")}</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary-300 text-sm text-gray-500">
                <Upload size={16} /> {isUploading ? t("common.loading") : t("resume.uploadHint")}
                <input type="file" accept="application/pdf,image/png,image/jpeg" className="hidden"
                  disabled={isUploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); }} />
              </label>
            )}
          </div>
        )}

        {/* Certificates (edit mode) */}
        {isEdit && (
          <div className="card space-y-2">
            <h2 className="font-semibold">{t("resume.certificates")}</h2>
            {certificates.length > 0 && (
              <ul className="space-y-1">
                {certificates.map(c => (
                  <li key={c} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <span className="truncate">{c}</span>
                    <button type="button" onClick={() => handleRemoveCert(c)} className="text-red-500 hover:underline ml-2 shrink-0">{t("common.delete")}</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder={t("resume.certUrl")} value={newCert} onChange={e=>setNewCert(e.target.value)} />
              <button type="button" onClick={handleAddCert} className="btn-secondary text-sm whitespace-nowrap">{t("resume.addCert")}</button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.save")}</button>
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">{t("common.cancel")}</button>
        </div>
      </form>
    </div>
  );
}
