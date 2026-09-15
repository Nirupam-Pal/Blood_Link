export type Role = "USER" | "BLOOD_BANK" | "ADMIN";

// Must match backend/src/common/enums/blood-group.enum.ts exactly —
// the Mongoose schema keys the inventory sub-document by these values.
export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "O+"
  | "O-"
  | "AB+"
  | "AB-";

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

export interface InventoryUpdateItem {
  bloodGroup: BloodGroup;
  units: number;
}

export interface BatchUpdateInventoryDto {
  items: InventoryUpdateItem[];
}

export interface InventoryItem {
  units: number;
  lastUpdated: string;
}

export type InventoryMap = Record<BloodGroup, InventoryItem>;

export interface UpdateInventoryResponse {
  message: string;
  data: BloodBank;
}

export interface SearchBloodBankDto {
  state: string;
  city?: string;
  subDivision?: string;
  district?: string;
}

export interface SearchBloodBankResponse {
  message: string;
  count: number;
  data: BloodBank[];
}

export interface UpdateBloodBankProfileDto {
  bloodBankName?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  address?: string;
  state?: string;
  district?: string;
  subDivision?: string;
  city?: string;
  pinCode?: string;
}

export interface UpdateBloodBankProfileResponse {
  message: string;
  data: BloodBank;
}