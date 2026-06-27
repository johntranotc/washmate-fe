import axiosClient from "./axiosClient";

export const staffApi = {
  getTodayBookings: () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return axiosClient.get("/bookings", { params: { date: dateStr } });
  },
  getStaffBookingById: (bookingId) => axiosClient.get(`/bookings/${bookingId}`),
  checkInBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/check-in`),
  startWashing: (bookingId) => axiosClient.post(`/bookings/${bookingId}/start`),
  completeBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/complete`),
  markNoShow: (bookingId) => axiosClient.post(`/bookings/${bookingId}/no-show`),
  cancelBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/cancel`),
};
