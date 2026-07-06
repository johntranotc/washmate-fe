import axiosClient from "./axiosClient";

export const userApi = {
  /**
   * GET /api/users/me
   * Returns MeResponse: { id, email, fullName, phone, status, roles, garageIds }
   */
  getMe: () => axiosClient.get("/users/me"),

  /**
   * PUT /api/users/me
   * Body: { fullName: string (NotBlank), phone: string, address: string }
   * Returns updated MeResponse
   */
  updateMe: (payload) => axiosClient.put("/users/me", payload),

  /**
   * POST /api/users/me/avatar — multipart, part name "file".
   * Returns AvatarUploadResponse: { avatarUrl }
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * DELETE /api/users/me/avatar
   * Returns AvatarUploadResponse: { avatarUrl: null }
   */
  deleteAvatar: () => axiosClient.delete("/users/me/avatar"),
};
