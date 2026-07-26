import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

function getLink(n: { title: string; data: unknown }): string | null {
  const d = n.data as Record<string, string> | undefined;
  if (d?.link) return d.link;
  const t = n.title.toLowerCase();
  if (t.includes("job seeker") || t.includes("student")) return "/admin/verify-students";
  if (t.includes("employer") || t.includes("enterprise") || t.includes("hirer")) return "/admin/approve-enterprises";
  if (t.includes("job posted")) return "/admin/jobs";
  return null;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(v => !v)} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllAsRead()} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Check size={12}/> Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
          ) : (
            notifications.slice(0, 10).map(n => (
              <button
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  setIsOpen(false);
                  const link = getLink(n);
                  if (link) navigate(link);
                }}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/50" : ""}`}
              >
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.createdAt?.slice(0, 16)}</p>
              </button>
            ))
          )}
          <Link to="/notifications" onClick={() => setIsOpen(false)} className="block text-center text-sm text-primary-600 py-2 hover:bg-gray-50 border-t">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
