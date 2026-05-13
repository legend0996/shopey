// Auth Service
import axiosInstance from "@/lib/axios";

export interface RegisterPayload { name: string; email: string; password: string; phone: string; referralCode?: string }
export interface VerifyPayload { email: string; code: string }
export interface LoginPayload { email: string; password: string }

export interface ForgotPasswordPayload { email: string }
export interface ResetPasswordPayload { email: string; code: string; newPassword: string }

export const authService = {
  register: (data: RegisterPayload) => axiosInstance.post("/auth/register", data),
  verify: (data: VerifyPayload) => axiosInstance.post("/auth/verify", data),
  login: (data: LoginPayload) => axiosInstance.post("/auth/login", data),
  forgotPassword: (email: string) => axiosInstance.post("/auth/forgot-password", { email }),
  resetPassword: (data: ResetPasswordPayload) => axiosInstance.post("/auth/reset-password", data),
};
