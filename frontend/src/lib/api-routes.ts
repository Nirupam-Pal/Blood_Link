const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REFRESH: `${API_BASE_URL}/auth/refresh`,
    },
    USERS: {
        REGISTER_USER: `${API_BASE_URL}/users/register-user`,
        ME: `${API_BASE_URL}/users/me`,
    },
    DONORS: {
        REGISTER_DONORS: `${API_BASE_URL}/donors/register`,
        SEARCH_DONORS: `${API_BASE_URL}/donors/search`,
    },
    BLOOD_BANKS: {
        REGISTER_BLOOD_BANK: `${API_BASE_URL}/blood-banks/register`,
        LIST: `${API_BASE_URL}/blood-banks`,
        SEARCH: `${API_BASE_URL}/blood-banks/search`,
    }
} as const;