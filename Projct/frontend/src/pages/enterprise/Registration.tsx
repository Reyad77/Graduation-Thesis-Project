import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import enterpriseService from "@/services/enterpriseService";
import { toast } from "react-hot-toast";

export default function EnterpriseRegistration() {
  const { t } = useTranslation(); const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ companyName:"", description:"", contactPerson:"", contactPhone:"", address:"", website:"" });

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    try { await enterpriseService.updateProfile(form); toast.success("Profile saved!"); navigate("/enterprise"); }
    catch { toast.error("Failed to save"); } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("enterprise.register")}</h1>
      <p className="text-sm text-gray-500 mt-1">Complete your company profile for admin approval.</p>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.companyName")} *</label><input className="input-field" required value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.contactPerson")} *</label><input className="input-field" required value={form.contactPerson} onChange={e=>setForm({...form,contactPerson:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.contactPhone")} *</label><input className="input-field" required value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.website")}</label><input className="input-field" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">{t("enterprise.address")} *</label><input className="input-field" required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">{t("enterprise.description")}</label><textarea className="input-field" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.submit")}</button>
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">{t("common.cancel")}</button>
        </div>
      </form>
    </div>
  );
}
