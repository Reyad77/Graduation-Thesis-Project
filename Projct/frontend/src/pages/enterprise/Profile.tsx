import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import enterpriseService from "@/services/enterpriseService";
import type { Enterprise } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function EnterpriseProfile() {
  const { t } = useTranslation(); const { user } = useAuth();
  const [profile, setProfile] = useState<Enterprise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ companyName:"", description:"", contactPerson:"", contactPhone:"", address:"", website:"" });

  useEffect(() => {
    enterpriseService.getProfile().then(p => { setProfile(p); setForm({ companyName:p.companyName||"", description:p.description||"", contactPerson:p.contactPerson||"", contactPhone:p.contactPhone||"", address:p.address||"", website:p.website||"" }); })
      .catch(()=>toast.error("Failed to load profile")).finally(()=>setIsLoading(false));
  }, []);

  const handleSave = async (e:React.FormEvent) => { e.preventDefault(); setIsSaving(true);
    try { const u = await enterpriseService.updateProfile(form); setProfile(u); toast.success("Updated!"); }
    catch { toast.error("Failed"); } finally { setIsSaving(false); }
  };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.profile")}</h1>
      <div className="card mt-6"><h2 className="font-semibold mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Email:</span><span className="ml-2">{user?.email}</span></div>
          <div><span className="text-gray-500">Name:</span><span className="ml-2">{user?.displayName}</span></div>
          <div><span className="text-gray-500">Status:</span><span className={`ml-2 font-medium ${profile?.isApproved?"text-green-600":"text-yellow-600"}`}>{profile?.isApproved?"Approved":"Pending Approval"}</span></div>
        </div>
      </div>
      <form onSubmit={handleSave} className="card mt-4 space-y-4">
        <h2 className="font-semibold">{t("profile.editProfile")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.companyName")}</label><input className="input-field" value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.contactPerson")}</label><input className="input-field" value={form.contactPerson} onChange={e=>setForm({...form,contactPerson:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.contactPhone")}</label><input className="input-field" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("enterprise.website")}</label><input className="input-field" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">{t("enterprise.address")}</label><input className="input-field" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">{t("enterprise.description")}</label><textarea className="input-field" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.save")}</button>
      </form>
    </div>
  );
}
