import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { connectionService } from "@/lib/services/connection-service";
import {
  AcceptConnectionResponse,
  Connection,
  ConnectionRequest,
  CreateConnectionRequestDto,
} from "@/types/connection.types";

interface ConnectionState {
  receivedRequests: ConnectionRequest[];
  sentRequests: ConnectionRequest[];
  connections: Connection[];
  isLoading: boolean;
  isSubmitting: boolean;
  // Id of the request currently being accepted/rejected/cancelled
  actingRequestId: string | null;
  error: string | null;

  // Actions
  fetchAll: () => Promise<void>;
  fetchSentAndConnections: () => Promise<void>;
  sendRequest: (data: CreateConnectionRequestDto) => Promise<ConnectionRequest>;
  acceptRequest: (id: string) => Promise<AcceptConnectionResponse>;
  rejectRequest: (id: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  clearError: () => void;
}

const toMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

// Replaces the matching request in a list with the server's updated copy,
// keeping the already-populated profile (PATCH responses are not populated).
const mergeRequest = (list: ConnectionRequest[], updated: ConnectionRequest) =>
  list.map((r) =>
    r._id === updated._id
      ? { ...r, status: updated.status, respondedAt: updated.respondedAt }
      : r
  );

export const useConnectionStore = create<ConnectionState>()(
  devtools(
    (set, get) => ({
      receivedRequests: [],
      sentRequests: [],
      connections: [],
      isLoading: false,
      isSubmitting: false,
      actingRequestId: null,
      error: null,

      fetchAll: async () => {
        set({ isLoading: true, error: null });
        try {
          const [received, sent, connections] = await Promise.all([
            connectionService.getReceivedRequests(),
            connectionService.getSentRequests(),
            connectionService.getConnections(),
          ]);
          set({
            receivedRequests: Array.isArray(received) ? received : [],
            sentRequests: Array.isArray(sent) ? sent : [],
            connections: Array.isArray(connections) ? connections : [],
            isLoading: false,
          });
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to load connections"), isLoading: false });
        }
      },

      fetchSentAndConnections: async () => {
        try {
          const [sent, connections] = await Promise.all([
            connectionService.getSentRequests(),
            connectionService.getConnections(),
          ]);
          set({
            sentRequests: Array.isArray(sent) ? sent : [],
            connections: Array.isArray(connections) ? connections : [],
          });
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to load connections") });
        }
      },

      sendRequest: async (data: CreateConnectionRequestDto) => {
        set({ isSubmitting: true, error: null });
        try {
          const request = await connectionService.sendRequest(data);
          set({ sentRequests: [request, ...get().sentRequests], isSubmitting: false });
          return request;
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to send request"), isSubmitting: false });
          throw err;
        }
      },

      acceptRequest: async (id: string) => {
        set({ actingRequestId: id, error: null });
        try {
          const response = await connectionService.acceptRequest(id);
          set({
            receivedRequests: get().receivedRequests.map((r) =>
              r._id === id ? { ...r, status: "ACCEPTED" } : r
            ),
            actingRequestId: null,
          });
          // Pull the populated connection list
          const connections = await connectionService.getConnections();
          set({ connections: Array.isArray(connections) ? connections : [] });
          return response;
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to accept request"), actingRequestId: null });
          throw err;
        }
      },

      rejectRequest: async (id: string) => {
        set({ actingRequestId: id, error: null });
        try {
          const updated = await connectionService.rejectRequest(id);
          set({
            receivedRequests: mergeRequest(get().receivedRequests, updated),
            actingRequestId: null,
          });
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to reject request"), actingRequestId: null });
          throw err;
        }
      },

      cancelRequest: async (id: string) => {
        set({ actingRequestId: id, error: null });
        try {
          const updated = await connectionService.cancelRequest(id);
          set({
            sentRequests: mergeRequest(get().sentRequests, updated),
            actingRequestId: null,
          });
        } catch (err: unknown) {
          set({ error: toMessage(err, "Failed to cancel request"), actingRequestId: null });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "ConnectionStore" }
  )
);
