import { Notification, UnreadCountResponse } from "@/types/notification.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";

export const notificationService = {
    async getNotifications(): Promise<Notification[]> {
        return apiClient<Notification[]>(API_ROUTES.NOTIFICATIONS.LIST, {
            method: 'GET',
            requiresAuth: true,
        });
    },

    async getUnreadCount(): Promise<UnreadCountResponse> {
        return apiClient<UnreadCountResponse>(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT, {
            method: 'GET',
            requiresAuth: true,
        });
    },

    async markAsRead(id: string): Promise<Notification> {
        return apiClient<Notification>(API_ROUTES.NOTIFICATIONS.MARK_READ(id), {
            method: 'PATCH',
            requiresAuth: true,
        });
    },

    async markAllAsRead(): Promise<void> {
        await apiClient(API_ROUTES.NOTIFICATIONS.READ_ALL, {
            method: 'PATCH',
            requiresAuth: true,
        });
    },
};
