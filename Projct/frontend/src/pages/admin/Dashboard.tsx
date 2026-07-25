import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Briefcase, ShieldCheck, FileText, CheckCircle, Clock } from "lucide-react";
import adminService from "@/services/adminService";
import type { User, Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getUsers().then(u=>setUsers(Array.isArray(u)?u:[])),
      adminService.getPendingJobs().then(j=>setPendingJobs(Array.isArray(j)?j:[])),
    ]).finally(()=>setIsLoading(false));
  }, []);

  if(isLoading) return <LoadingSpinner fullPage />;

  const students = users.filter(u=>u.role==="student").length;
  const enterprises = users.filter(u=>u.role==="enterprise").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.dashboard")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<Users size={20}/>} label="Total Users" value={users.length} color="bg-blue-100 text-blue-700"/>
        <StatCard icon={<ShieldCheck size={20}/>} label="Students" value={students} color="bg-green-100 text-green-700"/>
        <StatCard icon={<Briefcase size={20}/>} label="Enterprises" value={enterprises} color="bg-purple-100 text-purple-700"/>
        <StatCard icon={<Clock size={20}/>} label="Pending Jobs" value={pendingJobs.length} color="bg-yellow-100 text-yellow-700"/>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/admin/users" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><Users size={14} className="inline mr-1"/> User Management</Link>
            <Link to="/admin/verify-students" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><CheckCircle size={14} className="inline mr-1"/> Verify Students</Link>
            <Link to="/admin/approve-enterprises" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><ShieldCheck size={14} className="inline mr-1"/> Approve Enterprises</Link>
            <Link to="/admin/jobs" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><Briefcase size={14} className="inline mr-1"/> Audit Jobs</Link>
            <Link to="/admin/banners" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><FileText size={14} className="inline mr-1"/> Banners</Link>
            <Link to="/admin/announcements" className="p-3 bg-white rounded-lg border hover:border-primary-300 text-sm"><FileText size={14} className="inline mr-1"/> Announcements</Link>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Pending Jobs ({pendingJobs.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingJobs.slice(0,10).map(j=>(
              <div key={j.id} className="p-3 bg-white rounded-lg border text-sm">
                <p className="font-medium">{j.title}</p>
                <p className="text-xs text-gray-500">{j.location} · {j.salary} · {j.postedAt?.slice(0,10)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function StatCard({ icon, label, value, color }: { icon:React.ReactNode; label:string; value:number; color:string }) {
  return <div className="card flex items-center gap-3"><div className={`p-2 rounded-lg ${color}`}>{icon}</div><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500">{label}</p></div></div>;
}
