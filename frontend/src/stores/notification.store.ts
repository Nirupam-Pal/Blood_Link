import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { notificationService } from "@/lib/services/notification-service";
import { Notification } from "@/types/notification.types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const notifications = await notificationService.getNotifications();
          const list = Array.isArray(notifications) ? notifications : [];
          set({ notifications: list, isLoading: false });
          await get().fetchUnreadCount();
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load notifications";
          set({ error: message, isLoading: false });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const { count } = await notificationService.getUnreadCount();
          set({ unreadCount: typeof count === "number" ? count : 0 });
        } catch {
          // Badge count is non-critical; keep the previous value.
        }
      },

      markAsRead: async (id: string) => {
        const target = get().notifications.find((n) => n._id === id);
        if (!target || target.isRead) return;

        // Optimistic update
        set({
          notifications: get().notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });
        try {
          await notificationService.markAsRead(id);
        } catch {
          await get().fetchNotifications();
        }
      },

      markAllAsRead: async () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
        try {
          await notificationService.markAllAsRead();
        } catch {
          await get().fetchNotifications();
        }
      },

      reset: () => set({ notifications: [], unreadCount: 0, error: null, isLoading: false }),
    }),
    { name: "NotificationStore" }
  )
);
