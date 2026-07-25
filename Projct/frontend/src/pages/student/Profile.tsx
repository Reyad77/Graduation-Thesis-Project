import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import studentService from "@/services/studentService";
import type { Student } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function StudentProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ major:"", grade:"", year:1, skills:"", availability:"" });

  useEffect(() => {
    studentService.getProfile()
      .then(p => { setProfile(p); setForm({ major:p.major||"", grade:p.grade||"", year:p.year||1, skills:(p.skills||[]).join(", "), availability:p.availability||"" }); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      const updated = await studentService.updateProfile({
        major:form.major, grade:form.grade, year:form.year,
        skills:form.skills.split(",").map(s=>s.trim()).filter(Boolean), availability:form.availability,
      });
      setProfile(updated); toast.success("Profile updated!");
    } catch { toast.error("Failed to update"); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.profile")}</h1>
      <div className="card mt-6">
        <h2 className="font-semibold text-gray-700 mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Email:</span><span className="ml-2">{user?.email}</span></div>
          <div><span className="text-gray-500">Name:</span><span className="ml-2">{user?.displayName}</span></div>
          <div><span className="text-gray-500">{t("profile.verification")}:</span>
            <span className={`ml-2 font-medium ${profile?.isVerified?"text-green-600":"text-yellow-600"}`}>
              {profile?.isVerified?t("profile.verified"):t("profile.notVerified")}</span></div>
        </div>
      </div>
      <form onSubmit={handleSave} className="card mt-4 space-y-4">
        <h2 className="font-semibold">{t("profile.editProfile")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">{t("profile.major")}</label>
            <input className="input-field" value={form.major} onChange={e=>setForm({...form,major:e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("profile.grade")}</label>
            <select className="input-field" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>
              <option value="">--</option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option></select></div>
          <div><label className="block text-sm font-medium mb-1">{t("profile.year")}</label>
            <input type="number" min={1} max={5} className="input-field" value={form.year} onChange={e=>setForm({...form,year:Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1">{t("profile.availability")}</label>
            <input className="input-field" value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">{t("profile.skills")}</label>
          <input className="input-field" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="Python, JavaScript (comma-separated)" /></div>
        <button type="submit" disabled={isSaving} className="btn-primary">{isSaving?t("common.loading"):t("common.save")}</button>
      </form>
    </div>
  );
}
