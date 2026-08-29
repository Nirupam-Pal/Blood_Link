export type Role = "USER" | "BLOOD_BANK" | "ADMIN";

export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE";

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface ActiveDonor {
    _id: string;
    email: string;
    fullName: String;
    gender: Gender;
    bloodGroup: BloodGroup;
    state: string;
    district: string;
    subDivision: string;
    city: string;
}

export interface RegisterDonorDto {
    weight: number;
    takingMedication: boolean;
    recentTattoo: boolean;
    recentSurgery: boolean;
    hepatitis: boolean;
    hiv: boolean;
    diabetes: boolean;
    highBloodPressure: boolean;
    chronicDisease: boolean;
    consentInformation: boolean;
    consentContact: boolean;
    consentPrivacy: boolean;
}

export interface SearchDonorDto {
    state: string;
    bloodGroup: BloodGroup;
    district?: string;
    subDivision?: string;
    city?: string;
}

export interface DonorAssessmentResult {
  eligible: boolean;
  reasons: string[];
}

export interface RegisterDonorResponse {
  success: boolean;
  message: string;
  data: DonorAssessmentResult;
}