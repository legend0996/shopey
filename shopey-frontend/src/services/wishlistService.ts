import axiosInstance from "@/lib/axios";

export const wishlistService = {
  getAll: () => axiosInstance.get("/wishlist"),
  add: (product_id: string) => axiosInstance.post("/wishlist", { product_id }),
  remove: (product_id: string) => axiosInstance.delete(`/wishlist/${product_id}`),
};
