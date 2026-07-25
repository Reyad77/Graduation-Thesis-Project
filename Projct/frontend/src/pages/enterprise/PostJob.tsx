import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import enterpriseService from "@/services/enterpriseService";
import { toast } from "react-hot-toast";

export default function PostJob() {
  const { t } = useTranslation(); const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title:"", responsibilities:"", salary:"", workingHours:"",
    quota:1, location:"", skillRequirements:"", duration:"",
  });

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    try {
      await enterpriseService.createJob({
        ...form,
        skillRequirements:form.skillRequirements.split(",").map(s=>s.trim()).filter(Boolean),
      });
      toast.success("Job posted! Awaiting admin approval.");
      navigate("/enterprise/jobs");
    } catch { toast.error("Failed to post job"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.postJob")}</h1>
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
