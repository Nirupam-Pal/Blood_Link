import { ChatMessage, Conversation } from "@/types/chat.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";

export const chatService = {
    async getConversations(): Promise<Conversation[]> {
        return apiClient<Conversation[]>(API_ROUTES.CONVERSATIONS.LIST, {
            method: 'GET',
            requiresAuth: true,
        });
    },

    // Backend returns newest first; callers reverse for display.
    async getMessages(conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        return apiClient<ChatMessage[]>(`${API_ROUTES.CONVERSATIONS.MESSAGES(conversationId)}?${params.toString()}`, {
            method: 'GET',
            requiresAuth: true,
        });
    },
};
