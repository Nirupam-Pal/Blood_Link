import { bloodBankService } from "@/lib/services/blood-bank-service";
import {
  BatchUpdateInventoryDto,
  BloodBank,
  RegisterBloodBankDto,
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
  error: string | null;

  // Actions
  setPendingRegistrationData: (data: RegisterBloodBankDto | null) => void;
  registerBloodBank: (data: RegisterBloodBankDto) => Promise<BloodBank>;
  updateInventoryBatch: (
    data: BatchUpdateInventoryDto
  ) => Promise<UpdateInventoryResponse>;
  setCurrentBloodBank: (bank: BloodBank | null) => void;
  clearError: () => void;
}

export const useBloodBankStore = create<BloodBankState>()(
  devtools(
    (set) => ({
      currentBloodBank: null,
      pendingRegistrationData: null,
      isSubmitting: false,
      isUpdatingInventory: false,
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

      clearError: () => set({ error: null }),
    }),
    { name: "BloodBankStore" }
  )
);