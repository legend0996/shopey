"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
      },
    }),
    { name: "shopey-auth" }
  )
);
