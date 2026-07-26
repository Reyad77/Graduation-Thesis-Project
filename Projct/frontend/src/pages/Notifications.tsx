import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Trash2, Check, ArrowRight } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

function getLink(n: { title: string; data: unknown }): string | null {
  const d = n.data as Record<string, string> | undefined;
  if (d?.link) return d.link;
  const t = n.title.toLowerCase();
  if (t.includes("job seeker") || t.includes("student")) return "/admin/verify-students";
  if (t.includes("employer") || t.includes("enterprise") || t.includes("hirer")) return "/admin/approve-enterprises";
  if (t.includes("job posted")) return "/admin/jobs";
  return null;
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={() => markAllAsRead()} className="text-sm text-primary-600 hover:underline flex items-center gap-1"><Check size={14}/> Mark all read</button>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                const link = getLink(n);
                if (link) navigate(link);
              }}
              className={`card flex items-start justify-between gap-3 cursor-pointer hover:shadow-md transition-shadow ${!n.isRead ? "border-l-4 border-l-primary-500" : ""}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.createdAt?.slice(0, 16)}</p>
                {getLink(n) && (
                  <span className="text-[10px] text-primary-600 mt-1 flex items-center gap-0.5">
                    Click to view <ArrowRight size={10} />
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {!n.isRead && <button onClick={() => markAsRead(n.id)} className="p-1 text-xs text-primary-600 hover:bg-primary-50 rounded"><Check size={14}/></button>}
                <button onClick={() => deleteNotification(n.id)} className="p-1 text-xs text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
