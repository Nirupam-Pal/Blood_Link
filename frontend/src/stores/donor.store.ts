import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { donorService } from "@/lib/services/donor-service";
import {
  ActiveDonor,
  RegisterDonorDto,
  RegisterDonorResponse,
  SearchDonorDto,
} from "@/types/donor.types";
import { useAuthStore } from "./auth.store";

interface DonorState {
  donors: ActiveDonor[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedDonor: ActiveDonor | null;

  // Actions
  fetchActiveDonors: () => Promise<ActiveDonor[]>;
  searchDonors: (filters: SearchDonorDto) => Promise<ActiveDonor[]>;
  registerAsDonor: (data: RegisterDonorDto) => Promise<RegisterDonorResponse>;
  setSelectedDonor: (donor: ActiveDonor | null) => void;
  clearError: () => void;
  resetDonors: () => void;
}

export const useDonorStore = create<DonorState>()(
  devtools(
    (set) => ({
      donors: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      selectedDonor: null,

      fetchActiveDonors: async () => {
        set({ isLoading: true, error: null });
        try {
          const donors = await donorService.getActiveDonors();
          const donorList = Array.isArray(donors) ? donors : [];
          set({ donors: donorList, isLoading: false });
          return donorList;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load active donors";
          set({ error: message, isLoading: false });
          return [];
        }
      },

      searchDonors: async (filters: SearchDonorDto) => {
        set({ isLoading: true, error: null });
        try {
          const results = await donorService.searchDonors(filters);
          const donorList = Array.isArray(results) ? results : [];
          set({ donors: donorList, isLoading: false });
          return donorList;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to search donors";
          set({ error: message, isLoading: false });
          return [];
        }
      },

      registerAsDonor: async (data: RegisterDonorDto) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await donorService.registerAsDonor(data);

          // If evaluation is successful, synchronize user status in auth store
          if (response.success) {
            const authUser = useAuthStore.getState().user;
            if (authUser) {
              const updatedUser = { ...authUser, donor: true };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              useAuthStore.getState().setUser(updatedUser);
            }
          }

          set({ isSubmitting: false });
          return response;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Donor registration failed";
          set({ error: message, isSubmitting: false });
          throw err;
        }
      },

      setSelectedDonor: (donor: ActiveDonor | null) => {
        set({ selectedDonor: donor });
      },

      clearError: () => set({ error: null }),

      resetDonors: () => set({ donors: [], error: null, isLoading: false }),
    }),
    { name: "DonorStore" }
  )
);