import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import recruiterService from "@/services/recruiterService";
import { useAuth } from "@/hooks/useAuth";
import type { RecruiterType } from "@/types";
import { toast } from "react-hot-toast";

export default function RecruiterRegistration() {
  const { t } = useTranslation(); const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [recruiterType, setRecruiterType] = useState<RecruiterType>(
    user?.recruiterType ?? "individual",
  );
  const [form, setForm] = useState({
    companyName: "",
    businessLicense: "",
    description: "",
    contactPerson: user?.displayName ?? "",
    contactPhone: user?.phone ?? "",
    address: "",
    website: "",
  });

  const isEnterprise = recruiterType === "enterprise";

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    try {
      await recruiterService.updateProfile({ recruiterType, ...form });
      toast.success(t("recruiter.profileSaved"));
      navigate("/recruiter");
    }
    catch { toast.error(t("recruiter.profileFailed")); } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("recruiter.register")}</h1>
      <p className="text-sm text-gray-500 mt-1">{t("recruiter.registerSub")}</p>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        {/* Recruiter type */}
        <div>
          <label className="block text-sm font-medium mb-1">{t("recruiter.recruiterType")}</label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button type="button" onClick={() => setRecruiterType("individual")}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all
                ${!isEnterprise ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {t("recruiter.individual")}
            </button>
            <button type="button" onClick={() => setRecruiterType("enterprise")}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all
                ${isEnterprise ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {t("recruiter.enterprise")}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("recruiter.contactPerson")} *</label><input className="input-field" required value={form.contactPerson} onChange={e=>setForm({...form,contactPerson:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("recruiter.contactPhone")} *</label><input className="input-field" required value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} /></div>
          {isEnterprise && (
            <div><label className="block text-sm font-medium mb-1">{t("recruiter.companyName")} *</label><input className="input-field" required={isEnterprise} value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} /></div>
          )}
          <div><label className="block text-sm font-medium mb-1">{t("recruiter.website")}</label><input className="input-field" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} /></div>
        </div>
        {isEnterprise && (
          <div><label className="block text-sm font-medium mb-1">{t("recruiter.address")}</label><input className="input-field" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
        )}
        {isEnterprise && (
          <div><label className="block text-sm font-medium mb-1">{t("recruiter.businessLicense")}</label><input className="input-field" placeholder="https://..." value={form.businessLicense} onChange={e=>setForm({...form,businessLicense:e.target.value})} /></div>
        )}
        <div><label className="block text-sm font-medium mb-1">{t("recruiter.description")}</label><textarea className="input-field" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.submit")}</button>
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">{t("common.cancel")}</button>
        </div>
      </form>
    </div>
  );
}
