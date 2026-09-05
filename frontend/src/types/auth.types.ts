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

export interface User {
    id: string;
    email: string;
    fullName?: string;
    gender?: Gender;
    bloodGroup?: BloodGroup;
    state?: string;
    district?: string;
    subDivision?: string;
    city?: string;
    pinCode?: string;
    role: Role;
    donor?: boolean;
    isActive?: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface RegisterUserDto {
    fullname: string;
    email: string;
    password: string;
    bloodGroup: BloodGroup;
    gender: Gender;
    state: string;
    district: string;
    subDivision: string;
    city: string;
    pinCode: string;
}

export interface SendOtpDto {
    email: string;
}

export interface VerifyOtpDto {
    email: string;
    otp: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
}