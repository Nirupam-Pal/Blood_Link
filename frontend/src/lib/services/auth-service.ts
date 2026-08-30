import { AuthResponse, LoginDto, RegisterUserDto, User } from "@/types/auth.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";
import { BloodBank, RegisterBloodBankDto } from "@/types/blood-bank.types";

export const authService = {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        return apiClient<AuthResponse>(API_ROUTES.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
            requiresAuth: false,
        });
    },

    async registerUser(data: RegisterUserDto): Promise<User> {
        return apiClient<User>(API_ROUTES.USERS.REGISTER_USER, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false
        })
    },

    async registerBloodBank(data: RegisterBloodBankDto): Promise<BloodBank> {
        return apiClient<BloodBank>(API_ROUTES.BLOOD_BANKS.REGISTER_BLOOD_BANK, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        })
    },

    async getCurrentUser(): Promise<User> {
        return apiClient<User>(API_ROUTES.USERS.ME, {
            method: 'GET',
            requiresAuth: true,
        })
    },
}
