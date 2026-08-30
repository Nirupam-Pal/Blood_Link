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

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface InventoryItem {
  units: number;
  lastUpdated: string;
}

export interface BloodBank {
  _id: string;
  id?: string;
  bloodBankName: string;
  email: string;
  licenseNumber: string;
  phoneNumber: string;
  address: string;
  state: string;
  district: string;
  subDivision: string;
  city: string;
  pinCode: string;
  emailVerified: boolean;
  isActive: boolean;
  inventory?: Record<BloodGroup, InventoryItem>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterBloodBankDto {
  bloodBankName: string;
  email: string;
  password: string;
  licenseNumber: string;
  phoneNumber: string;
  address: string;
  state: string;
  district: string;
  subDivision: string;
  city: string;
  pinCode: string;
}
