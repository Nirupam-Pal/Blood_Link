import { authService } from "@/lib/services/auth-service";
import { bloodBankService } from "@/lib/services/blood-bank-service";
import {
  LoginDto,
  RegisterUserDto,
  Role,
  SendOtpDto,
  SendOtpResponse,
  UpdateUserProfileDto,
  User,
  VerifyOtpDto,
  VerifyOtpResponse,
} from "@/types/auth.types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Reads the `role` claim out of the access token so we know whether to
// refresh via /users/me or /blood-banks/profile without waiting on a
// (possibly stale or absent) cached user object.
function getRoleFromToken(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded?.role ?? null;
  } catch {
    return null;
  }
}

export type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isInitializing: boolean;
  isSubmitting: boolean;
  isUpdatingProfile: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;

  initialize: () => Promise<void>;
  registerUser: (data: RegisterUserDto) => Promise<User>;
  sendOtp: (data: SendOtpDto) => Promise<SendOtpResponse>;
  verifyOtp: (data: VerifyOtpDto) => Promise<VerifyOtpResponse>;
  setPendingVerificationEmail: (email: string | null) => void;
  login: (credentials: LoginDto) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateProfile: (data: UpdateUserProfileDto) => Promise<User>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      status: "idle",
      isInitializing: true,
      isSubmitting: false,
      isUpdatingProfile: false,
      error: null,
      pendingVerificationEmail: null,

      initialize: async () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("accessToken");
        const cachedUser = localStorage.getItem("user");

        if (!token) {
          set({ user: null, status: "unauthenticated", isInitializing: false });
          return;
        }

        if (cachedUser) {
          try {
            const parsedUser: User = JSON.parse(cachedUser);
            set({ user: parsedUser, status: "authenticated" });
          } catch {}
        }

        try {
          const role =
            getRoleFromToken(token) ??
            (cachedUser ? (JSON.parse(cachedUser) as User).role : null);

          const freshUser: User =
            role === "BLOOD_BANK"
              ? ({
                  ...(await bloodBankService.getProfile()),
                  role: "BLOOD_BANK",
                } as unknown as User)
              : await authService.getCurrentUser();

          localStorage.setItem("user", JSON.stringify(freshUser));
          set({
            user: freshUser,
            status: "authenticated",
            isInitializing: false,
          });
        } catch {
          if (!cachedUser) {
            set({
              user: null,
              status: "unauthenticated",
              isInitializing: false,
            });
          } else {
            set({ isInitializing: false });
          }
        }
      },

      registerUser: async (data: RegisterUserDto) => {
        set({ error: null, isSubmitting: true });
        try {
          const newUser = await authService.registerUser(data);
          set({ error: null });
          return newUser;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Registration failed";
          set({ error: message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      sendOtp: async (data: SendOtpDto): Promise<SendOtpResponse> => {
        set({ error: null, isSubmitting: true });
        try {
          const response = await authService.sendOtp(data);
          set({ error: null });
          return response;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to send OTP";
          set({ error: message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      verifyOtp: async (data: VerifyOtpDto): Promise<VerifyOtpResponse> => {
        set({ error: null, isSubmitting: true });
        try {
          const response = await authService.verifyOtp(data);
          set({ error: null, pendingVerificationEmail: null });
          return response;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Invalid OTP";
          set({ error: message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      login: async (credentials: LoginDto) => {
        set({ error: null, isSubmitting: true });
        try {
          const response = await authService.login(credentials);

          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;

          set({ user: response.user, status: "authenticated", error: null });
          return response.user;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, status: "unauthenticated" });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({
          user: null,
          status: "unauthenticated",
          error: null,
          pendingVerificationEmail: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user, status: user ? "authenticated" : "unauthenticated" });
      },

      updateProfile: async (data: UpdateUserProfileDto) => {
        set({ isUpdatingProfile: true, error: null });
        try {
          const updatedUser = await authService.updateProfile(data);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          set({ user: updatedUser, error: null });
          return updatedUser;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to update profile";
          set({ error: message });
          throw err;
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "AuthStore" }
  )
);