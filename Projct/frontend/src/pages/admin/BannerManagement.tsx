import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit, Image, Eye, EyeOff } from "lucide-react";
import adminService from "@/services/adminService";
import type { Banner } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminBannerManagement() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", link: "", order: 0, isActive: true });
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = () => adminService.getBanners().then(b => setBanners(Array.isArray(b) ? b : [])).finally(() => setIsLoading(false));
  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm({ title: "", link: "", order: 0, isActive: true }); setEditId(null); setShowForm(false); };
  const handleEdit = (b: Banner) => { setForm({ title: b.title, link: b.link, order: b.order, isActive: b.isActive }); setEditId(b.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) { await adminService.updateBanner(editId, form); toast.success(t("admin.updatedToast")); }
      else { await adminService.createBanner(new FormData()); toast.success(t("admin.createdToast")); }
      resetForm(); fetch();
    } catch { toast.error(t("admin.failedToast")); }
  };
  const handleDelete = async (id: string) => { await adminService.deleteBanner(id); toast.success(t("admin.deletedToast")); fetch(); };

  if (isLoading) return <LoadingSpinner fullPage />;

  const active = banners.filter(b => b.isActive).length;
  const inactive = banners.filter(b => !b.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.bannerTitle")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{banners.length} banners</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={14} /> {showForm ? t("common.cancel") : t("admin.add")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Image size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{banners.length}</p><p className="text-[11px] text-gray-500">{t("admin.totalUsers")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Eye size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{active}</p><p className="text-[11px] text-gray-500">{t("admin.active")}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-500"><EyeOff size={18} /></div>
          <div><p className="text-lg font-bold text-gray-900">{inactive}</p><p className="text-[11px] text-gray-500">{t("admin.banned")}</p></div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">{editId ? t("common.edit") : t("admin.add")} Banner</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1"><label className="block text-xs mb-1 text-gray-500">{t("admin.title")}</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="flex-1"><label className="block text-xs mb-1 text-gray-500">{t("admin.link")}</label><input className="input-field" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} /></div>
            <button type="submit" className="btn-primary text-sm">{editId ? t("admin.update") : t("admin.add")}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.title")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[30%]">{t("admin.link")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[8%]">{t("admin.order")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-[10%]">{t("admin.status")}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs w-[22%]">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 text-xs">{b.title}</td>
                <td className="px-4 py-3 text-gray-500 text-[11px] truncate max-w-[200px]">{b.link || "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{b.order}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium ${b.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                    {b.isActive ? t("admin.active") : t("admin.banned")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] hover:bg-blue-100"><Edit size={11} className="inline mr-0.5" />{t("common.edit")}</button>
                    <button onClick={() => handleDelete(b.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] hover:bg-red-100"><Trash2 size={11} className="inline mr-0.5" />{t("common.delete")}</button>
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
