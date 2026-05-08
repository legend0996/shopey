import axiosInstance from "@/lib/axios";

export const wishlistService = {
  getAll: () => axiosInstance.get("/wishlist"),
  add: (product_id: string | number) => axiosInstance.post("/wishlist/add", { product_id }),
  remove: (product_id: string | number) => axiosInstance.post("/wishlist/remove", { product_id }),
  exists: (product_id: string | number) => axiosInstance.get(`/wishlist/${product_id}`),
};
