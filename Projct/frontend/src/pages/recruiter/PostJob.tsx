import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import recruiterService from "@/services/recruiterService";
import { toast } from "react-hot-toast";

export default function PostJob() {
  const { t } = useTranslation(); const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title:"", responsibilities:"", salary:"", workingHours:"",
    quota:1, location:"", skillRequirements:"", duration:"",
  });

  // Edit mode: load the existing job when ?edit=<id> is present.
  useEffect(() => {
    if (!editId) return;
    recruiterService.getJobs().then(jobs => {
      const job = (Array.isArray(jobs) ? jobs : []).find(j => j.id === editId);
      if (job) {
        setForm({
          title: job.title || "",
          responsibilities: job.responsibilities || "",
          salary: job.salary || "",
          workingHours: job.workingHours || "",
          quota: job.quota || 1,
          location: job.location || "",
          skillRequirements: (job.skillRequirements || []).join(", "),
          duration: job.duration || "",
        });
      }
    }).catch(() => {});
  }, [editId]);

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    const payload = {
      ...form,
      skillRequirements: form.skillRequirements.split(",").map(s=>s.trim()).filter(Boolean),
    };
    try {
      if (editId) {
        await recruiterService.updateJob(editId, payload);
        toast.success(t("recruiter.jobUpdated"));
      } else {
        await recruiterService.createJob(payload);
        toast.success(t("recruiter.jobPosted"));
      }
      navigate("/recruiter/jobs");
    } catch { toast.error(t("recruiter.jobPostFailed")); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{editId ? t("recruiter.editJob") : t("recruiter.postJob")}</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div><label className="block text-sm font-medium mb-1">{t("jobs.title")} *</label><input className="input-field" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("jobs.salary")} *</label><input className="input-field" required value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("jobs.location")} *</label><input className="input-field" required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("jobs.workingHours")}</label><input className="input-field" value={form.workingHours} onChange={e=>setForm({...form,workingHours:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("jobs.quota")}</label><input className="input-field" type="number" min={1} value={form.quota} onChange={e=>setForm({...form,quota:Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("jobs.duration")}</label><input className="input-field" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("jobs.skillRequirements")}</label><input className="input-field" value={form.skillRequirements} onChange={e=>setForm({...form,skillRequirements:e.target.value})} placeholder="React, Excel (comma-separated)" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">{t("jobs.responsibilities")} *</label><textarea className="input-field" rows={4} required value={form.responsibilities} onChange={e=>setForm({...form,responsibilities:e.target.value})} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.submit")}</button>
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">{t("common.cancel")}</button>
        </div>
      </form>
    </div>
  );
}
