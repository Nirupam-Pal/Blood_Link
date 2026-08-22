import { AuthResponse, LoginDto, RegisterDonorDto, RegisterDonorResponse, RegisterUserDto, User } from "@/types/auth.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";

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

    async getCurrentUser(): Promise<User> {
        return apiClient<User>(API_ROUTES.USERS.ME, {
            method: 'GET',
            requiresAuth: true,
        })
    },

    async registerAsDonor(data: RegisterDonorDto): Promise<RegisterDonorResponse> {
        return apiClient<RegisterDonorResponse>(API_ROUTES.DONORS.REGISTER_DONORS, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true
        })
    }
}