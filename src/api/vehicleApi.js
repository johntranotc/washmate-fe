import axiosClient from "./axiosClient";

/**
 * Vehicle API — chỉ gọi endpoint thật của BE, không enrich/mock dữ liệu phía FE.
 *
 * BE endpoints (VehicleController):
 *   GET    /api/v1/vehicles               (ADMIN/STAFF — toàn bộ xe)
 *   GET    /api/v1/vehicles/my-vehicles   (CUSTOMER — xe của tôi)
 *   POST   /api/v1/vehicles/my-vehicles   (CUSTOMER — tạo xe, user lấy từ token)
 *   PUT    /api/v1/vehicles/{id}
 *   DELETE /api/v1/vehicles/{id}
 */
export const vehicleApi = {
  // Toàn bộ xe trong hệ thống (chỉ ADMIN/STAFF)
  getAllVehicles: () => axiosClient.get("/v1/vehicles"),

  // Xe của khách hàng đang đăng nhập — trả nguyên dữ liệu BE, không chèn model giả
  getMyVehicles: () => axiosClient.get("/v1/vehicles/my-vehicles"),

  // Khách tạo xe: dùng endpoint /my-vehicles — BE tự gắn user từ token,
  // KHÔNG gửi userId chế từ FE.
  createVehicle: (payload) =>
    axiosClient.post("/v1/vehicles/my-vehicles", {
      licensePlate: (payload?.licensePlate || "").trim().toUpperCase(),
      brand: (payload?.brand || "").trim(),
      model: (payload?.model || "").trim(),
      color: (payload?.color || "").trim(),
    }),

  updateVehicle: (id, payload) =>
    axiosClient.put(`/v1/vehicles/${id}`, {
      licensePlate: (payload?.licensePlate || "").trim().toUpperCase(),
      brand: (payload?.brand || "").trim(),
      model: (payload?.model || "").trim(),
      color: (payload?.color || "").trim(),
      status: payload?.status || "ACTIVE",
    }),

  // Xóa thật qua BE — nếu BE từ chối thì trả lỗi cho UI hiển thị,
  // không còn "xóa giả" bằng localStorage.
  deleteVehicle: (id) => axiosClient.delete(`/v1/vehicles/${id}`),
};
