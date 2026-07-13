import axiosClient from "./axiosClient";

// API booking phía KHÁCH — các bước vận hành (check-in, rửa, hoàn tất) thuộc staffApi.
export const bookingApi = {
  createBooking: (payload) => axiosClient.post("/bookings", payload),
  getMyBookings: () => axiosClient.get("/bookings/me"),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  // BE chỉ cho hủy khi PENDING/CONFIRMED; booking đã thanh toán phải hoàn tiền.
  cancelBooking: (id) => axiosClient.post(`/bookings/${id}/cancel`),
};
