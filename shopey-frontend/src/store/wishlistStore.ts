"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "@/services/wishlistService";

interface WishlistState {
  ids: string[];
  syncing: boolean;
  syncFromServer: () => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      syncing: false,
      syncFromServer: async () => {
        set({ syncing: true });
        try {
          const response = await wishlistService.getAll();
          const rows = response.data ?? [];
          const ids = rows.map((item: { id: string | number }) => String(item.id));
          set({ ids });
        } catch {
          set({ ids: [] });
        } finally {
          set({ syncing: false });
        }
      },
      toggle: async (id) => {
        const normalizedId = String(id);
        const exists = get().ids.includes(normalizedId);

        if (exists) {
          await wishlistService.remove(normalizedId);
          set({ ids: get().ids.filter((itemId) => itemId !== normalizedId) });
          return false;
        }

        await wishlistService.add(normalizedId);
        set({ ids: [...get().ids, normalizedId] });
        return true;
      },
      has: (id) => get().ids.includes(String(id)),
      clear: () => set({ ids: [] }),
    }),
    { name: "shopey-wishlist" }
  )
);
