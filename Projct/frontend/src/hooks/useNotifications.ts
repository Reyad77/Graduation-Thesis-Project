import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@/types";
import api from "@/services/api";

/**
 * Hook for fetching and managing user notifications.
 *
 * Returns the notification list, unread count, and actions to mark
 * individual or all notifications as read.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/notifications");
      setNotifications(data.items ?? data);
      setUnreadCount(
        (data.items ?? data).filter((n: Notification) => !n.isRead).length,
      );
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await api.patch(`/notifications/${id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
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
