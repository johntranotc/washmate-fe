import axiosClient from "./axiosClient";

// API booking phía KHÁCH — các bước vận hành (check-in, rửa, hoàn tất) thuộc staffApi.
export const bookingApi = {
  createBooking: (payload) => axiosClient.post("/bookings", payload),
  getMyBookings: () => axiosClient.get("/bookings/me"),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  // BE chỉ cho hủy khi PENDING/CONFIRMED; booking đã thanh toán phải hoàn tiền.
  cancelBooking: (id) => axiosClient.post(`/bookings/${id}/cancel`),
  // Đổi lịch — PUT /bookings/{id}, chỉ khi PENDING/CONFIRMED và thanh toán còn PENDING.
  // body: { garageId, slotId, serviceId, vehicleId, bookingDate } (đủ 5 field, BE validate lại slot trống).
  updateBooking: (id, payload) => axiosClient.put(`/bookings/${id}`, payload),
};
