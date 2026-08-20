import { authService } from "@/lib/services/auth-service";
import { LoginDto, User } from "@/types/auth.types";
import { error } from "console";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthState {
    user: User | null;
    status: AuthStatus;
    isInitializing: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    login: (credentials: LoginDto) => Promise<User>;
    logout: () => void;
    setUser: (user: User | null) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            status: 'idle',
            isInitializing: true,
            error: null,

            initialize: async () => {
                if(typeof window === 'undefined') return;

                const token = localStorage.getItem('accessToken');
                const cachedUser = localStorage.getItem('user');

                if(!token) {
                    set({ user: null, status: 'unauthenticated', isInitializing: false });
                    return;
                }

                if(cachedUser) {
                    try {
                        const parsedUser: User = JSON.parse(cachedUser);
                        set({ user: parsedUser, status: 'authenticated' });
                    } catch {

                    }
                }

                try {
                    const freshUser = await authService.getCurrentUser();
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    set({ user: freshUser, status: 'authenticated', isInitializing: false });
                } catch {
                    if(!cachedUser) {
                        set({ user: null, status: 'unauthenticated', isInitializing: false });
                    } else {
                        set({ isInitializing: false });
                    }
                }
            },

            login: async (credentials: LoginDto) => {
                set({ error: null })
                try {
                    const response = await authService.login(credentials);

                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;

                    set({ user: response.user, status: 'authenticated', error: null });
                    return response.user;
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Login failed';
                    set({ error: message, status: 'unauthenticated' });
                    throw err;
                }
            },

            logout: () => {
                if(typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                }
                set({ user: null, status: 'unauthenticated', error: null });
            },

            setUser: (user: User | null) => {
                set({ user, status: user ? 'authenticated' : 'unauthenticated' });
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'AuthStore' }
    )
)