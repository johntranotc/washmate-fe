import axiosClient from "./axiosClient";

export const staffApi = {
  // GET /api/bookings?fromDate=today&toDate=today  (works for any role with access)
  getTodayBookings: () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return axiosClient.get("/bookings", { params: { fromDate: dateStr, toDate: dateStr } });
  },
  // GET /api/bookings (all bookings)
  getAllBookings: () => axiosClient.get("/bookings"),
  // GET /api/bookings/{id}
  getStaffBookingById: (bookingId) => axiosClient.get(`/bookings/${bookingId}`),
  // POST /api/bookings/{id}/confirm
  confirmBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/confirm`),
  // POST /api/bookings/{id}/check-in
  checkInBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/check-in`),
  // POST /api/bookings/{id}/start-washing  (BE endpoint, was wrongly "/start")
  startWashing: (bookingId) => axiosClient.post(`/bookings/${bookingId}/start-washing`),
  // POST /api/bookings/{id}/complete
  completeBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/complete`),
  // POST /api/bookings/{id}/no-show
  markNoShow: (bookingId) => axiosClient.post(`/bookings/${bookingId}/no-show`),
  // POST /api/bookings/{id}/cancel
  cancelBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/cancel`),
};
