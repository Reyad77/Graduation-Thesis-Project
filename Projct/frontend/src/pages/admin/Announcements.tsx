import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit } from "lucide-react";
import adminService from "@/services/adminService";
import type { Announcement } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminAnnouncements() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  type FormType = { title:string; content:string; type:"announcement"|"article"; isActive:boolean; priority:number };
  const [form, setForm] = useState<FormType>({ title:"", content:"", type:"announcement", isActive:true, priority:0 });
  const [editId, setEditId] = useState<string|null>(null);

  const fetch = () => adminService.getAnnouncements().then(a=>setItems(Array.isArray(a)?a:[])).finally(()=>setIsLoading(false));
  useEffect(()=>{fetch();},[]);

  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault();
    try {
      if(editId) { await adminService.updateAnnouncement(editId, form); toast.success("Updated"); }
      else { await adminService.createAnnouncement(form); toast.success("Created"); }
      setForm({title:"",content:"",type:"announcement",isActive:true,priority:0}); setEditId(null); fetch();
    } catch { toast.error("Failed"); }
  };
  const handleDelete = async (id:string) => { await adminService.deleteAnnouncement(id); toast.success("Deleted"); fetch(); };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.announcements")}</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1"><label className="block text-xs mb-1">Title</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
          <div><label className="block text-xs mb-1">Type</label><select className="input-field" value={form.type} onChange={e=>setForm({...form,type:e.target.value as "announcement"|"article"})}><option value="announcement">Announcement</option><option value="article">Article</option></select></div>
        </div>
        <div><label className="block text-xs mb-1">Content</label><textarea className="input-field" rows={3} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} /></div>
        <button type="submit" className="btn-primary text-sm"><Plus size={14} className="inline mr-1"/>{editId?"Update":"Create"}</button>
      </form>
      <div className="mt-6 space-y-2">
        {items.map(a=>(
          <div key={a.id} className="card flex items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{a.title} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{a.type}</span></p><p className="text-xs text-gray-500 truncate max-w-sm">{a.content.slice(0,80)}...</p></div>
            <div className="flex gap-1">
              <button onClick={()=>{setEditId(a.id);setForm({title:a.title,content:a.content,type:a.type,isActive:a.isActive,priority:a.priority});}} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"><Edit size={12}/></button>
              <button onClick={()=>handleDelete(a.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
