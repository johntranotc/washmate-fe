import axios from "axios";

const apiRoot = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

const axiosClient = axios.create({
  baseURL: apiRoot.endsWith("/api") ? apiRoot : `${apiRoot}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    return body && typeof body === "object" && "success" in body ? body.data : body;
  },
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    if (status === 401) {
      ["accessToken", "refreshToken", "currentUser", "roles", "garageIds"].forEach((key) => localStorage.removeItem(key));
      if (window.location.pathname !== "/dang-nhap") window.location.assign("/dang-nhap");
    }
    return Promise.reject({
      status,
      errorCode: body?.errorCode || "UNKNOWN_ERROR",
      message: body?.message || (error.code === "ECONNABORTED" ? "Máy chủ phản hồi quá lâu." : "Không thể kết nối đến máy chủ."),
      details: body?.details || null,
    });
  },
);

export default axiosClient;
