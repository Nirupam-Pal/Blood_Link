import { ActiveDonor, RegisterDonorDto, RegisterDonorResponse, SearchDonorDto } from "@/types/donor.types";
import { apiClient } from "../api-client";
import { API_ROUTES } from "../api-routes";


export const donorService = {
    async registerAsDonor(data: RegisterDonorDto): Promise<RegisterDonorResponse> {
        return apiClient<RegisterDonorResponse>(API_ROUTES.DONORS.REGISTER_DONORS, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true
        })
    },

    async getActiveDonors(): Promise<ActiveDonor[]> {
        return apiClient<ActiveDonor[]>(API_ROUTES.DONORS.ACTIVE, {
            method: 'GET',
            requiresAuth: true,
        })
    },

    async searchDonors(searchDonorDto: SearchDonorDto): Promise<ActiveDonor[]> {
        const params = new URLSearchParams();

        if (searchDonorDto.state) params.append("state", searchDonorDto.state);
        if (searchDonorDto.bloodGroup) params.append("bloodGroup", searchDonorDto.bloodGroup);
        if (searchDonorDto.district) params.append("district", searchDonorDto.district);
        if (searchDonorDto.subDivision) params.append("subDivision",searchDonorDto.subDivision);
        if (searchDonorDto.city) params.append("city", searchDonorDto.city);

        const url = `${API_ROUTES.DONORS.SEARCH_DONORS}?${params.toString()}`
        return apiClient<ActiveDonor[]>(url, {
            method: 'GET',
            requiresAuth: true
        })
    }
}