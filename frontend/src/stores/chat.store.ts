import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { chatService } from "@/lib/services/chat-service";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { ChatMessage, Conversation } from "@/types/chat.types";

const PAGE_SIZE = 50;

interface ChatState {
  conversations: Conversation[];
  // Messages per conversation, oldest first
  messages: Record<string, ChatMessage[]>;
  hasMore: Record<string, boolean>;
  activeConversationId: string | null;
  isConnected: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  clearError: () => void;
}

// Inserts a message keeping the list unique by id (the sender receives both
// the ack and the room broadcast for the same message).
const upsertMessage = (list: ChatMessage[] = [], message: ChatMessage) =>
  list.some((m) => m._id === message._id) ? list : [...list, message];

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => {
      const handleIncoming = (message: ChatMessage) => {
        const { messages, conversations } = get();
        const conversationId = String(message.conversationId);

        set({
          messages: {
            ...messages,
            [conversationId]: upsertMessage(messages[conversationId], message),
          },
          // Bump the conversation to the top with its new preview
          conversations: [...conversations]
            .map((c) =>
              c._id === conversationId
                ? { ...c, lastMessageId: message, lastMessageAt: message.createdAt }
                : c
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            ),
        });
      };

      const joinAllRooms = () => {
        const socket = getSocket();
        get().conversations.forEach((c) =>
          socket.emit("conversation:join", { conversationId: c._id })
        );
      };

      return {
        conversations: [],
        messages: {},
        hasMore: {},
        activeConversationId: null,
        isConnected: false,
        isLoadingConversations: false,
        isLoadingMessages: false,
        isSending: false,
        error: null,

        connect: () => {
          const socket = getSocket();
          if (socket.connected) return;

          socket.off("connect").off("message:new").off("exception");
          socket.on("connect", () => {
            set({ isConnected: true });
            // Rooms are per-connection, so rejoin after every (re)connect
            joinAllRooms();
          });
          socket.on("disconnect", () => set({ isConnected: false }));
          socket.on("message:new", handleIncoming);
          socket.on("exception", (payload: { message?: string }) => {
            set({ error: payload?.message || "Chat error" });
          });
          socket.connect();
        },

        disconnect: () => {
          disconnectSocket();
          set({ isConnected: false });
        },

        fetchConversations: async () => {
          set({ isLoadingConversations: true, error: null });
          try {
            const conversations = await chatService.getConversations();
            set({
              conversations: Array.isArray(conversations) ? conversations : [],
              isLoadingConversations: false,
            });
            if (getSocket().connected) joinAllRooms();
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Failed to load conversations";
            set({ error: message, isLoadingConversations: false });
          }
        },

        setActiveConversation: (id: string | null) => {
          set({ activeConversationId: id });
        },

        fetchMessages: async (conversationId: string) => {
          set({ isLoadingMessages: true, error: null });
          try {
            const page = await chatService.getMessages(conversationId, PAGE_SIZE, 0);
            const list = Array.isArray(page) ? [...page].reverse() : [];
            set({
              messages: { ...get().messages, [conversationId]: list },
              hasMore: { ...get().hasMore, [conversationId]: list.length === PAGE_SIZE },
              isLoadingMessages: false,
            });
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Failed to load messages";
            set({ error: message, isLoadingMessages: false });
          }
        },

        loadOlderMessages: async (conversationId: string) => {
          const existing = get().messages[conversationId] || [];
          set({ isLoadingMessages: true });
          try {
            const page = await chatService.getMessages(conversationId, PAGE_SIZE, existing.length);
            const older = Array.isArray(page) ? [...page].reverse() : [];
            const known = new Set(existing.map((m) => m._id));
            set({
              messages: {
                ...get().messages,
                [conversationId]: [...older.filter((m) => !known.has(m._id)), ...existing],
              },
              hasMore: { ...get().hasMore, [conversationId]: older.length === PAGE_SIZE },
              isLoadingMessages: false,
            });
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Failed to load messages";
            set({ error: message, isLoadingMessages: false });
          }
        },

        sendMessage: async (conversationId: string, content: string) => {
          const socket = getSocket();
          if (!socket.connected) {
            set({ error: "Chat is offline. Reconnecting..." });
            get().connect();
            throw new Error("Chat is offline");
          }

          set({ isSending: true, error: null });
          try {
            // Failed sends surface through the "exception" event; the timeout
            // stops us waiting forever for an ack that will never arrive.
            const message: ChatMessage = await socket
              .timeout(10000)
              .emitWithAck("message:send", { conversationId, content });
            if (message?._id) handleIncoming(message);
            set({ isSending: false });
          } catch (err: unknown) {
            set({
              isSending: false,
              error: get().error || (err instanceof Error ? err.message : "Failed to send message"),
            });
            throw err;
          }
        },

        clearError: () => set({ error: null }),
      };
    },
    { name: "ChatStore" }
  )
);
