import axiosClient from "./axiosClient";

export const userApi = {
  /**
   * GET /api/users/me
   * Returns MeResponse: { id, email, fullName, phone, status, roles, garageIds }
   */
  getMe: () => axiosClient.get("/users/me"),

  /**
   * PUT /api/users/me
   * Body: { fullName: string (NotBlank), phone: string (NotBlank) }
   * Returns updated MeResponse
   */
  updateMe: (payload) => axiosClient.put("/users/me", payload),
};
