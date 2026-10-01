const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REFRESH: `${API_BASE_URL}/auth/refresh`,
        SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
        VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`
    },
    USERS: {
        REGISTER_USER: `${API_BASE_URL}/users/register-user`,
        ME: `${API_BASE_URL}/users/me`,
    },
    DONORS: {
        ACTIVE: `${API_BASE_URL}/donors/active`,
        REGISTER_DONORS: `${API_BASE_URL}/donors/register`,
        SEARCH_DONORS: `${API_BASE_URL}/donors/search`,
    },
    BLOOD_BANKS: {
        REGISTER_BLOOD_BANK: `${API_BASE_URL}/blood-banks/register`,
        LIST: `${API_BASE_URL}/blood-banks`,
        SEARCH: `${API_BASE_URL}/blood-banks/search`,
        UPDATE_INVENTORY: `${API_BASE_URL}/blood-banks/inventory`,
        PROFILE: `${API_BASE_URL}/blood-banks/profile`,
    },
    CONNECTION_REQUESTS: {
        CREATE: `${API_BASE_URL}/connection-requests`,
        RECEIVED: `${API_BASE_URL}/connection-requests/received`,
        SENT: `${API_BASE_URL}/connection-requests/sent`,
        ACCEPT: (id: string) => `${API_BASE_URL}/connection-requests/${id}/accept`,
        REJECT: (id: string) => `${API_BASE_URL}/connection-requests/${id}/reject`,
        CANCEL: (id: string) => `${API_BASE_URL}/connection-requests/${id}/cancel`,
    },
    CONNECTIONS: {
        LIST: `${API_BASE_URL}/connections`,
    },
    NOTIFICATIONS: {
        LIST: `${API_BASE_URL}/notifications`,
        UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
        READ_ALL: `${API_BASE_URL}/notifications/read-all`,
        MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    },
    CONVERSATIONS: {
        LIST: `${API_BASE_URL}/conversations`,
        MESSAGES: (id: string) => `${API_BASE_URL}/conversations/${id}/messages`,
    },
    SOCKET_URL: API_BASE_URL,
} as const;