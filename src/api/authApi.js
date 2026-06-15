import axiosClient from "./axiosClient";

export const authApi = {
  login: (payload) => axiosClient.post("/auth/login", payload),
  register: (payload) => axiosClient.post("/auth/register", payload),
  forgotPassword: (payload) => axiosClient.post("/auth/forgot-password", payload),
  verifyOtp: (payload) => axiosClient.post("/auth/verify-otp", payload),
  resetPassword: (payload) => axiosClient.post("/auth/reset-password", payload),
  refresh: (refreshToken) => axiosClient.post("/auth/refresh", { refreshToken }),
  logout: () => axiosClient.post("/auth/logout"),
};
