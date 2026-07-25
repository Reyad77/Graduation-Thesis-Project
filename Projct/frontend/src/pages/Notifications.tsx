import { useNotifications } from "@/hooks/useNotifications";
import { Trash2, Check } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

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
            <div key={n.id} className={`card flex items-start justify-between gap-3 ${!n.isRead ? "border-l-4 border-l-primary-500" : ""}`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.createdAt?.slice(0, 16)}</p>
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
