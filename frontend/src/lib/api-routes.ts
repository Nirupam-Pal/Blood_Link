const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/users/register-user`,
        REGISTER_BLOOD_BANK: `${API_BASE_URL}/blood-banks/register`
    }
}