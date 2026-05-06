// Auth Service
import axiosInstance from "@/lib/axios";

export interface RegisterPayload { name: string; email: string; password: string; phone: string; referralCode?: string }
export interface VerifyPayload { email: string; code: string }
export interface LoginPayload { email: string; password: string }

export const authService = {
  register: (data: RegisterPayload) => axiosInstance.post("/auth/register", data),
  verify: (data: VerifyPayload) => axiosInstance.post("/auth/verify", data),
  login: (data: LoginPayload) => axiosInstance.post("/auth/login", data),
};
