import { useState, useEffect, useCallback, useRef } from "react";
import type { Notification } from "@/types";
import api from "@/services/api";

const POLL_INTERVAL = 5000; // 5 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data } = await api.get("/notifications");
      const list: Notification[] = Array.isArray(data) ? data : (data?.items ?? []);
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial fetch + start polling
  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications in real-time
    intervalRef.current = setInterval(() => {
      fetchNotifications(true); // silent — no loading spinner
    }, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
