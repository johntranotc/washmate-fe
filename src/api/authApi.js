import axiosClient from "./axiosClient";

export const authApi = {
  login: (payload) => axiosClient.post("/auth/login", payload),
  register: (payload) => axiosClient.post("/auth/register", payload),
  refresh: () => axiosClient.post("/auth/refresh"),
  logout: () => axiosClient.post("/auth/logout"),
};
