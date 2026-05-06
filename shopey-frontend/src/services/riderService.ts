import axiosInstance from "@/lib/axios";

export const riderService = {
  login: (data: { phone: string; password: string }) => axiosInstance.post("/rider/login", data),
  getDeliveries: () => axiosInstance.get("/rider/deliveries"),
  getDeliveryById: (id: string) => axiosInstance.get(`/rider/deliveries/${id}`),
  updateStatus: (data: { delivery_id: string; status: string }) =>
    axiosInstance.post("/rider/status", data),
};
