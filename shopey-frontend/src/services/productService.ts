import axiosInstance from "@/lib/axios";

export interface ProductQueryParams {
  q?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  newest?: boolean;
  brand?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popularity";
  page?: number;
  limit?: number;
}

export const productService = {
  getAll: (params?: ProductQueryParams) =>
    axiosInstance.get("/products", { params }),
  search: (params?: ProductQueryParams) => axiosInstance.get("/products/search", { params }),
  getCategories: () => axiosInstance.get("/products/categories"),
  suggestions: (q: string, limit = 8) =>
    axiosInstance.get("/products/suggestions", { params: { q, limit } }),
  getFeatured: () => axiosInstance.get("/products/featured"),
  getById: (id: string) => axiosInstance.get(`/products/${id}`),
  replaceGallery: (id: string, images: Array<{ url: string; is_thumbnail?: boolean }>) =>
    axiosInstance.post(`/products/${id}/gallery`, { images }),
  reorderGallery: (id: string, imageIds: number[]) =>
    axiosInstance.patch(`/products/${id}/gallery/reorder`, { imageIds }),
  setThumbnail: (id: string, imageId: number) =>
    axiosInstance.patch(`/products/${id}/gallery/thumbnail`, { imageId }),
  removeGalleryImage: (id: string, imageId: number) =>
    axiosInstance.delete(`/products/${id}/gallery/${imageId}`),
};
