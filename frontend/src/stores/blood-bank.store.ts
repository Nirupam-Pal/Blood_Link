import { bloodBankService } from "@/lib/services/blood-bank-service";
import {
  BatchUpdateInventoryDto,
  BloodBank,
  RegisterBloodBankDto,
  SearchBloodBankDto,
  UpdateBloodBankProfileDto,
  UpdateInventoryResponse,
} from "@/types/blood-bank.types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "./auth.store";

interface BloodBankState {
  currentBloodBank: BloodBank | null;
  pendingRegistrationData: RegisterBloodBankDto | null;
  isSubmitting: boolean;
  isUpdatingInventory: boolean;
  isUpdatingProfile: boolean;
  bloodBanks: BloodBank[];
  isSearching: boolean;
  error: string | null;

  // Actions
  setPendingRegistrationData: (data: RegisterBloodBankDto | null) => void;
  registerBloodBank: (data: RegisterBloodBankDto) => Promise<BloodBank>;
  updateInventoryBatch: (
    data: BatchUpdateInventoryDto
  ) => Promise<UpdateInventoryResponse>;
  setCurrentBloodBank: (bank: BloodBank | null) => void;
  fetchAllBloodBanks: () => Promise<BloodBank[]>;
  searchBloodBanks: (filters: SearchBloodBankDto) => Promise<BloodBank[]>;
  updateProfile: (data: UpdateBloodBankProfileDto) => Promise<BloodBank>;
  clearError: () => void;
}

export const useBloodBankStore = create<BloodBankState>()(
  devtools(
    (set) => ({
      currentBloodBank: null,
      pendingRegistrationData: null,
      isSubmitting: false,
      isUpdatingInventory: false,
      isUpdatingProfile: false,
      bloodBanks: [],
      isSearching: false,
      error: null,

      setPendingRegistrationData: (data: RegisterBloodBankDto | null) => {
        set({ pendingRegistrationData: data });
      },

      registerBloodBank: async (
        data: RegisterBloodBankDto
      ): Promise<BloodBank> => {
        set({ error: null, isSubmitting: true });
        try {
          const newBloodBank = await bloodBankService.registerBloodBank(data);
          set({ pendingRegistrationData: null, error: null });
          return newBloodBank;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Blood Bank registration failed";
          set({ error: message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateInventoryBatch: async (data: BatchUpdateInventoryDto) => {
        set({ isUpdatingInventory: true, error: null });
        try {
          const response = await bloodBankService.updateInventoryBatch(data);

          // Synchronize auth state if active user is this blood bank
          const authUser = useAuthStore.getState().user;
          if (authUser && authUser.id === response.data.id) {
            useAuthStore.getState().setUser({
              ...authUser,
              ...response.data,
            });
          }

          set({ currentBloodBank: response.data, error: null });
          return response;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to update inventory";
          set({ error: message });
          throw err;
        } finally {
          set({ isUpdatingInventory: false });
        }
      },

      setCurrentBloodBank: (bank: BloodBank | null) =>
        set({ currentBloodBank: bank }),

      fetchAllBloodBanks: async () => {
        set({ isSearching: true, error: null });
        try {
          const banks = await bloodBankService.getAllBloodBanks();
          const bankList = Array.isArray(banks) ? banks : [];
          set({ bloodBanks: bankList, isSearching: false });
          return bankList;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load blood banks";
          set({ error: message, isSearching: false });
          return [];
        }
      },

      searchBloodBanks: async (filters: SearchBloodBankDto) => {
        set({ isSearching: true, error: null });
        try {
          const response = await bloodBankService.searchBloodBanks(filters);
          const bankList = Array.isArray(response.data) ? response.data : [];
          set({ bloodBanks: bankList, isSearching: false });
          return bankList;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to search blood banks";
          set({ error: message, isSearching: false });
          return [];
        }
      },

      updateProfile: async (data: UpdateBloodBankProfileDto) => {
        set({ isUpdatingProfile: true, error: null });
        try {
          const response = await bloodBankService.updateProfile(data);

          // Synchronize auth state if active user is this blood bank
          const authUser = useAuthStore.getState().user;
          if (authUser && authUser.id === response.data.id) {
            useAuthStore.getState().setUser({
              ...authUser,
              ...response.data,
            });
          }

          set({ currentBloodBank: response.data, error: null });
          return response.data;
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
    { name: "BloodBankStore" }
  )
);