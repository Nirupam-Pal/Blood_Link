import { BatchUpdateInventoryDto, BloodBank, RegisterBloodBankDto, UpdateInventoryResponse } from "@/types/blood-bank.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";

export const bloodBankService = {
  async registerBloodBank(data: RegisterBloodBankDto): Promise<BloodBank> {
    return apiClient<BloodBank>(API_ROUTES.BLOOD_BANKS.REGISTER_BLOOD_BANK, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async updateInventoryBatch(data: BatchUpdateInventoryDto): Promise<UpdateInventoryResponse> {
    return apiClient<UpdateInventoryResponse>(API_ROUTES.BLOOD_BANKS.UPDATE_INVENTORY, {
        method: 'PATCH',
        body: JSON.stringify(data),
        requiresAuth: true,
    });
  },

  async getProfile(): Promise<BloodBank> {
    return apiClient<BloodBank>(API_ROUTES.BLOOD_BANKS.PROFILE, {
      method: 'GET',
      requiresAuth: true,
    });
  },
};
