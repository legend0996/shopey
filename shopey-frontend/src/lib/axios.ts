import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const token =
      path.startsWith("/admin")
        ? localStorage.getItem("admin_token")
        : path.startsWith("/rider")
          ? localStorage.getItem("rider_token")
          : localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/admin")) {
          localStorage.removeItem("admin_token");
        } else if (path.startsWith("/rider")) {
          localStorage.removeItem("rider_token");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
