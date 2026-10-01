import {
    AcceptConnectionResponse,
    Connection,
    ConnectionRequest,
    CreateConnectionRequestDto,
} from "@/types/connection.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";

export const connectionService = {
    async sendRequest(data: CreateConnectionRequestDto): Promise<ConnectionRequest> {
        return apiClient<ConnectionRequest>(API_ROUTES.CONNECTION_REQUESTS.CREATE, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    },

    async getReceivedRequests(): Promise<ConnectionRequest[]> {
        return apiClient<ConnectionRequest[]>(API_ROUTES.CONNECTION_REQUESTS.RECEIVED, {
            method: 'GET',
            requiresAuth: true,
        });
    },

    async getSentRequests(): Promise<ConnectionRequest[]> {
        return apiClient<ConnectionRequest[]>(API_ROUTES.CONNECTION_REQUESTS.SENT, {
            method: 'GET',
            requiresAuth: true,
        });
    },

    async acceptRequest(id: string): Promise<AcceptConnectionResponse> {
        return apiClient<AcceptConnectionResponse>(API_ROUTES.CONNECTION_REQUESTS.ACCEPT(id), {
            method: 'PATCH',
            requiresAuth: true,
        });
    },

    async rejectRequest(id: string): Promise<ConnectionRequest> {
        return apiClient<ConnectionRequest>(API_ROUTES.CONNECTION_REQUESTS.REJECT(id), {
            method: 'PATCH',
            requiresAuth: true,
        });
    },

    async cancelRequest(id: string): Promise<ConnectionRequest> {
        return apiClient<ConnectionRequest>(API_ROUTES.CONNECTION_REQUESTS.CANCEL(id), {
            method: 'PATCH',
            requiresAuth: true,
        });
    },

    async getConnections(): Promise<Connection[]> {
        return apiClient<Connection[]>(API_ROUTES.CONNECTIONS.LIST, {
            method: 'GET',
            requiresAuth: true,
        });
    },
};
