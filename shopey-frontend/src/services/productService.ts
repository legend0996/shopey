import axiosInstance from "@/lib/axios";

export const productService = {
  getAll: (params?: { search?: string; category?: string; page?: number }) =>
    axiosInstance.get("/products", { params }),
  getFeatured: () => axiosInstance.get("/products/featured"),
  getById: (id: string) => axiosInstance.get(`/products/${id}`),
};
