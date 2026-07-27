import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit } from "lucide-react";
import adminService from "@/services/adminService";
import type { Banner } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminBannerManagement() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ title:"", link:"", order:0, isActive:true });
  const [editId, setEditId] = useState<string|null>(null);

  const fetch = () => adminService.getBanners().then(b=>setBanners(Array.isArray(b)?b:[])).finally(()=>setIsLoading(false));
  useEffect(()=>{fetch();},[]);

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault();
    try {
      if(editId) { await adminService.updateBanner(editId, form); toast.success(t("admin.updatedToast")); }
      else { await adminService.createBanner(new FormData()); toast.success(t("admin.createdToast")); }
      setForm({title:"",link:"",order:0,isActive:true}); setEditId(null); fetch();
    } catch { toast.error(t("admin.failedToast")); }
  };
  const handleDelete = async (id:string) => { await adminService.deleteBanner(id); toast.success(t("admin.deletedToast")); fetch(); };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t("admin.bannerTitle")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("admin.bannerDesc")}</p>
      <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="block text-xs mb-1">{t("admin.title")}</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
          <div className="flex-1"><label className="block text-xs mb-1">{t("admin.link")}</label><input className="input-field" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} /></div>
          <button type="submit" className="btn-primary text-sm"><Plus size={14} className="inline mr-1"/>{editId?t("admin.update"):t("admin.add")}</button>
        </div>
      </form>
      <div className="space-y-2">
        {banners.map(b=>(
          <div key={b.id} className="card flex items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{b.title}</p><p className="text-xs text-gray-500">{b.link} · {t("admin.order")}: {b.order} · {b.isActive?t("admin.active"):t("admin.banned")}</p></div>
            <div className="flex gap-1">
              <button onClick={()=>{setEditId(b.id);setForm({title:b.title,link:b.link,order:b.order,isActive:b.isActive});}} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"><Edit size={12}/></button>
              <button onClick={()=>handleDelete(b.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
