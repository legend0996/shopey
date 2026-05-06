import axiosInstance from "@/lib/axios";

export interface CheckoutPayload {
  items: { product_id: string; quantity: number }[];
  county: string;
  town: string;
  description: string;
}
export interface MpesaPayload { order_id: string; phone: string }

export const orderService = {
  getMyOrders: () => axiosInstance.get("/orders/my-orders"),
  getOrderById: (id: string) => axiosInstance.get(`/orders/my-orders/${id}`),
  checkout: (data: CheckoutPayload) => axiosInstance.post("/orders/checkout", data),
  getReceipt: (id: string) => axiosInstance.get(`/orders/receipt/${id}`, { responseType: "blob" }),
  mpesaPay: (data: MpesaPayload) => axiosInstance.post("/mpesa/pay", data),
};
