import axiosClient from "./axiosClient";

export const staffApi = {
  getTodayBookings: () => axiosClient.get("/bookings", { params: { date: new Date().toISOString().slice(0, 10) } }),
  getStaffBookingById: (bookingId) => axiosClient.get(`/bookings/${bookingId}`),
  checkInBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/check-in`),
  startWashing: (bookingId) => axiosClient.post(`/bookings/${bookingId}/start`),
  completeBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/complete`),
  markNoShow: (bookingId) => axiosClient.post(`/bookings/${bookingId}/no-show`),
  cancelBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/cancel`),
};
