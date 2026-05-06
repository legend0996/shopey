import axiosInstance from "@/lib/axios";

export const adminService = {
  login: (data: { email: string; password: string }) => axiosInstance.post("/admin/login", data),
  verify: (data: { email: string; code: string }) => axiosInstance.post("/admin/verify", data),
  getDashboard: () => axiosInstance.get("/admin/dashboard"),
  getOrders: () => axiosInstance.get("/admin/orders"),
  getOrderFull: (id: string) => axiosInstance.get(`/admin/order/${id}/full`),
  updateOrderStatus: (data: { order_id: string; status: string }) =>
    axiosInstance.post("/admin/order/status", data),
  assignRider: (data: { order_id: string; rider_id: string }) =>
    axiosInstance.post("/admin/order/assign", data),
  updateDeliveryStatus: (data: { order_id: string; status: string }) =>
    axiosInstance.post("/admin/delivery/status", data),
  createShop: (data: Record<string, unknown>) => axiosInstance.post("/admin/shops", data),
  featureUser: (data: { user_id: string }) => axiosInstance.post("/admin/feature-user", data),
  featureProduct: (data: { product_id: string }) =>
    axiosInstance.post("/admin/feature-product", data),
};
