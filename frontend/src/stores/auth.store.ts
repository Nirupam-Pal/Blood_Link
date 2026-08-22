import { authService } from "@/lib/services/auth-service";
import { LoginDto, RegisterDonorDto, RegisterDonorResponse, RegisterUserDto, User } from "@/types/auth.types";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthState {
    user: User | null;
    status: AuthStatus;
    isInitializing: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    registerUser: (data: RegisterUserDto) => Promise<User>;
    registerAsDonor: (data: RegisterDonorDto) => Promise<RegisterDonorResponse>;
    login: (credentials: LoginDto) => Promise<User>;
    logout: () => void;
    setUser: (user: User | null) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set, get) => ({
            user: null,
            status: 'idle',
            isInitializing: true,
            isSubmitting: false,
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

            registerUser: async (data: RegisterUserDto) => {
                set({ error: null, isSubmitting: true });
                try{
                    const newUser = await authService.registerUser(data);
                    set({ error: null });
                    return newUser;
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Registration failed';
                    set({ error: message });
                    throw err;
                } finally {
                    set({ isSubmitting: false })
                }
            },

            registerAsDonor: async (data: RegisterDonorDto) => {
                set({ error: null, isSubmitting: true });
                try{
                    const result = await authService.registerAsDonor(data);

                    if(result.success) {
                        const currentUser = get().user;
                        if(currentUser) {
                            const updatedUser: User ={ ...currentUser, donor: true };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            set({ user: updatedUser })
                        }
                    }
                    return result;
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Donor assessment failed';
                    set({ error: message });
                    throw err;
                } finally {
                    set({ isSubmitting: false })
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