import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, CheckCircle as UnbanIcon } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminUserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () => adminService.getUsers().then(u=>setUsers(Array.isArray(u)?u:[])).finally(()=>setIsLoading(false));
  useEffect(()=>{fetch();},[]);

  const handleBan = async (uid:string) => { try{await adminService.banUser(uid); toast.success("Banned"); fetch();}catch{toast.error("Failed");} };
  const handleUnban = async (uid:string) => { try{await adminService.unbanUser(uid); toast.success("Unbanned"); fetch();}catch{toast.error("Failed");} };

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.users")}</h1>
      <div className="mt-6 space-y-2">
        {users.map(u=>(
          <div key={u.uid} className="card flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">{u.displayName} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{u.role}</span></p>
              <p className="text-xs text-gray-500">{u.email} · {u.phone}</p>
            </div>
            <div className="flex gap-1">
              {!u.isActive && <button onClick={()=>handleUnban(u.uid)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700"><UnbanIcon size={12} className="inline"/> Unban</button>}
              {u.isActive && <button onClick={()=>handleBan(u.uid)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"><Ban size={12} className="inline"/> Ban</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
