import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminEnterpriseApproval() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () => { adminService.getUsers().then(u=>setUsers(Array.isArray(u)?u:u)).finally(()=>setIsLoading(false)); };
  useEffect(()=>{fetch();},[]);

  const handleApprove = async (uid:string) => { try{await adminService.approveEnterprise(uid); toast.success(t("admin.approvedToast")); fetch();}catch{toast.error(t("admin.failedToast"));} };
  const enterprises = users.filter(u=>u.role==="enterprise");

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t("admin.approveTitle")}</h1>
      <p className="text-sm text-gray-500 mb-6">{enterprises.length} {t("admin.enterprises").toLowerCase()}</p>
      <div className="space-y-2">
        {enterprises.map(u=>(
          <div key={u.uid} className="card flex items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{u.displayName}</p><p className="text-xs text-gray-500">{u.email}</p></div>
            <button onClick={()=>handleApprove(u.uid)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={12} className="inline"/> {t("admin.approve")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
