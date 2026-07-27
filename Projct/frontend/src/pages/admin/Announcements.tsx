import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit } from "lucide-react";
import adminService from "@/services/adminService";
import type { Announcement } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

type AType = "announcement" | "article";
type AnnForm = { title: string; content: string; type: AType; isActive: boolean; priority: number };

export default function AdminAnnouncements() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<AnnForm>({ title: "", content: "", type: "announcement", isActive: true, priority: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = () => adminService.getAnnouncements().then(a => setItems(Array.isArray(a) ? a : [])).finally(() => setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) { await adminService.updateAnnouncement(editId, form); toast.success(t("admin.updatedToast")); }
      else { await adminService.createAnnouncement(form); toast.success(t("admin.createdToast")); }
      setForm({ title: "", content: "", type: "announcement", isActive: true, priority: 0 }); setEditId(null); fetch();
    } catch { toast.error(t("admin.failedToast")); }
  };
  const handleDelete = async (id: string) => { await adminService.deleteAnnouncement(id); toast.success(t("admin.deletedToast")); fetch(); };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t("admin.announceTitle")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("admin.announceDesc")}</p>
      <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1"><label className="block text-xs mb-1">{t("admin.title")}</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="block text-xs mb-1">{t("admin.type")}</label>
            <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AType })}>
              <option value="announcement">{t("admin.announcement")}</option>
              <option value="article">{t("admin.article")}</option>
            </select></div>
        </div>
        <div><label className="block text-xs mb-1">{t("admin.content")}</label><textarea className="input-field" rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
        <button type="submit" className="btn-primary text-sm"><Plus size={14} className="inline mr-1" />{editId ? t("admin.update") : t("admin.create")}</button>
      </form>
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="card flex items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{a.title} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{a.type}</span></p><p className="text-xs text-gray-500 truncate max-w-sm">{a.content.slice(0, 80)}...</p></div>
            <div className="flex gap-1">
              <button onClick={() => { setEditId(a.id); setForm({ title: a.title, content: a.content, type: a.type as AType, isActive: a.isActive, priority: a.priority }); }} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"><Edit size={12} /></button>
              <button onClick={() => handleDelete(a.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
