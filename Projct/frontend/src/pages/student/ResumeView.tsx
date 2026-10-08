import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import studentService from "@/services/studentService";
import type { Resume } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FileText, Award, Clock, Briefcase, FolderGit2, Languages, GraduationCap, BadgeCheck, Edit, Trash2, Download } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StudentResumeView() {
  const { t } = useTranslation(); const { id } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if(id) studentService.getResume(id).then(setResume).finally(()=>setIsLoading(false)); }, [id]);
  const handleDelete = async () => { if(!confirm("Delete?")) return; await studentService.deleteResume(id!); toast.success("Deleted"); window.history.back(); };

  if(isLoading) return <LoadingSpinner fullPage />;
  if(!resume) return <div className="text-center py-16">Not found</div>;

  const levelKey: Record<string, string> = {
    Basic: t("resume.levelBasic"), Conversational: t("resume.levelConversational"),
    Fluent: t("resume.levelFluent"), Native: t("resume.levelNative"),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("resume.preview")}</h1>
        <div className="flex gap-2">
          <Link to={`/student/resume/${id}/edit`} className="btn-secondary flex items-center gap-1"><Edit size={14}/> {t("common.edit")}</Link>
          <button onClick={handleDelete} className="btn-secondary !text-red-600"><Trash2 size={14}/></button>
        </div>
      </div>

      <div className="card space-y-6">
        {resume.resumeFile && (
          <a href={resume.resumeFile} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
            <Download size={14}/> {t("resume.download")} ({resume.resumeFileName || "PDF"})
          </a>
        )}
        {resume.isDefault && (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><BadgeCheck size={12}/> {t("resume.defaultBadge")}</span>
        )}

        {/* Professional summary */}
        {resume.summary && (
          <Section icon={<FileText size={16}/>} title={t("resume.summary")}>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{resume.summary}</p>
          </Section>
        )}

        {/* Education */}
        {(resume.university || resume.major || resume.grade) && (
          <Section icon={<GraduationCap size={16}/>} title={t("resume.education")}>
            <div className="space-y-1 text-sm text-gray-700">
              {resume.university && <p><strong>{t("resume.university")}:</strong> {resume.university}</p>}
              {resume.major && <p><strong>{t("profile.major")}:</strong> {resume.major}</p>}
              {resume.grade && <p><strong>{t("profile.grade")}:</strong> {resume.grade}</p>}
            </div>
          </Section>
        )}

        {/* Work experience entries */}
        {resume.experiences.length > 0 && (
          <Section icon={<Briefcase size={16}/>} title={t("resume.workExperience")}>
            <div className="space-y-4">
              {resume.experiences.map((x, i) => (
                <div key={i} className="border-l-2 border-primary-200 pl-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="font-semibold text-sm text-gray-900">{x.title}</p>
                    <span className="text-xs text-gray-500">{x.startDate}{x.startDate && x.endDate ? " – " : ""}{x.endDate}</span>
                  </div>
                  <p className="text-sm text-primary-700">{x.company}</p>
                  {x.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{x.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Free-text experience (legacy) */}
        {resume.experience && (
          <Section icon={<Clock size={16}/>} title={t("resume.experience")}>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{resume.experience}</p>
          </Section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <Section icon={<FolderGit2 size={16}/>} title={t("resume.projects")}>
            <div className="space-y-3">
              {resume.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">{p.link}</a>}
                  </div>
                  {p.description && <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{p.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <Section icon={<Award size={16}/>} title={t("profile.skills")}>
            <div className="flex flex-wrap gap-1">{resume.skills.map(s=><span key={s} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>)}</div>
          </Section>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <Section icon={<Languages size={16}/>} title={t("resume.languages")}>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((l, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                  {l.language} · {levelKey[l.level] || l.level}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Certificates */}
        {resume.certificates.length > 0 && (
          <Section icon={<BadgeCheck size={16}/>} title={t("resume.certificates")}>
            <ul className="space-y-1">
              {resume.certificates.map((c, i) => (
                <li key={i}><a href={c} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline break-all">{c}</a></li>
              ))}
            </ul>
          </Section>
        )}

        {/* Availability */}
        {resume.availableHours && (
          <Section icon={<Clock size={16}/>} title={t("resume.availableHours")}>
            <p className="text-sm text-gray-700">{resume.availableHours}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
function Section({ icon, title, children }: { icon:React.ReactNode; title:string; children:React.ReactNode }) {
  return <div><div className="flex items-center gap-2 text-gray-700 font-medium mb-2">{icon}{title}</div>{children}</div>;
}
