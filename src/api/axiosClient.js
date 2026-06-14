import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;

    if (body && typeof body === "object" && "success" in body) {
      return body.data;
    }

    return body;
  },
  (error) => {
    const body = error.response?.data;

    return Promise.reject({
      status: error.response?.status,
      errorCode: body?.errorCode || "UNKNOWN_ERROR",
      message: body?.message || "Có lỗi xảy ra khi gọi API",
      details: body?.details || null,
      timestamp: body?.timestamp || null,
    });
  },
);

export default axiosClient;
