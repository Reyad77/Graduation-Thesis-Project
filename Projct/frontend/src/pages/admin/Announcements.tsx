import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit, Megaphone, FileText } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AnnForm>({ title: "", content: "", type: "announcement", isActive: true, priority: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = () => adminService.getAnnouncements().then(a => setItems(Array.isArray(a) ? a : [])).finally(() => setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm({ title: "", content: "", type: "announcement", isActive: true, priority: 0 }); setEditId(null); setShowForm(false); };
  const handleEdit = (a: Announcement) => { setForm({ title: a.title, content: a.content, type: a.type as AType, isActive: a.isActive, priority: a.priority }); setEditId(a.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) { await adminService.updateAnnouncement(editId, form); toast.success(t("admin.updatedToast")); }
      else { await adminService.createAnnouncement(form); toast.success(t("admin.createdToast")); }
      resetForm(); fetch();
    } catch { toast.error(t("admin.failedToast")); }
  };
  const handleDelete = async (id: string) => { await adminService.deleteAnnouncement(id); toast.success(t("admin.deletedToast")); fetch(); };

  if (isLoading) return <LoadingSpinner fullPage />;

  const announcements = items.filter(i => i.type === "announcement");
  const articles = items.filter(i => i.type === "article");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.announceTitle")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} items</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={14} /> {showForm ? t("common.cancel") : t("admin.create")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Megaphone size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{announcements.length}</p><p className="text-[11px] text-gray-500">{t("admin.announcement")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><FileText size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{articles.length}</p><p className="text-[11px] text-gray-500">{t("admin.article")}</p></div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">{editId ? t("common.edit") : t("admin.create")}</h3>
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs mb-1 text-gray-500">{t("admin.title")}</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="block text-xs mb-1 text-gray-500">{t("admin.type")}</label>
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AType })}>
                <option value="announcement">{t("admin.announcement")}</option>
                <option value="article">{t("admin.article")}</option>
              </select></div>
          </div>
          <div><label className="block text-xs mb-1 text-gray-500">{t("admin.content")}</label><textarea className="input-field" rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">{editId ? t("admin.update") : t("admin.create")}</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">{t("common.cancel")}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.title")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[10%]">{t("admin.type")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[10%]">{t("admin.status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[35%]">{t("admin.content")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[15%]">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 text-xs">{a.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.type === "announcement" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{a.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium ${a.isActive ? "text-emerald-600" : "text-gray-400"}`}>{a.isActive ? t("admin.active") : t("admin.banned")}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-[11px] truncate max-w-[250px]">{a.content}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => handleEdit(a)} className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] hover:bg-blue-100"><Edit size={11} className="inline mr-0.5" />{t("common.edit")}</button>
                    <button onClick={() => handleDelete(a.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] hover:bg-red-100"><Trash2 size={11} className="inline mr-0.5" />{t("common.delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
