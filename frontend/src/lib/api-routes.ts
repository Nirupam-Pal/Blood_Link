const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER_USER: `${API_BASE_URL}/users/register-user`,
        REGISTER_BLOOD_BANK: `${API_BASE_URL}/blood-banks/register`,
        REFRESH: `${API_BASE_URL}/auth/refresh`,
        ME: `${API_BASE_URL}/users/me`
    },
    USERS: {
        DONORS: `${API_BASE_URL}/users/donors`,
        SEARCH_DONORS: `${API_BASE_URL}/users/search-donors`,
    },
    BLOOD_BANKS: {
        LIST: `${API_BASE_URL}/blood-banks`,
        SEARCH: `${API_BASE_URL}/blood-banks/search`,
    }
} as const;