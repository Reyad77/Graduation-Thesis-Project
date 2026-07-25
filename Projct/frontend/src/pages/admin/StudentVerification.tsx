import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import adminService from "@/services/adminService";
import type { User } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function AdminStudentVerification() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () => { adminService.getUsers().then(u=>setUsers(Array.isArray(u)?u:u)).finally(()=>setIsLoading(false)); };
  useEffect(()=>{fetch();},[]);

  const handleVerify = async (uid:string) => { try{await adminService.verifyStudent(uid); toast.success("Verified"); fetch();}catch{toast.error("Failed");} };
  const students = users.filter(u=>u.role==="student" && u.isActive);

  if(isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("admin.verifyStudents")}</h1>
      <p className="text-sm text-gray-500 mt-1">{students.length} students</p>
      <div className="mt-6 space-y-2">
        {students.map(u=>(
          <div key={u.uid} className="card flex items-center justify-between gap-3">
            <div><p className="font-medium text-sm">{u.displayName}</p><p className="text-xs text-gray-500">{u.email}</p></div>
            <button onClick={()=>handleVerify(u.uid)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={12} className="inline"/> Verify</button>
          </div>
        ))}
      </div>
    </div>
  );
}
