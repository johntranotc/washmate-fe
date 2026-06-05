import axiosClient from "./axiosClient";

export const bookingApi = {
  createBooking: (payload) => axiosClient.post("/bookings", payload),
  getMyBookings: () => axiosClient.get("/bookings"),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  cancelBooking: (id) => axiosClient.post(`/bookings/${id}/cancel`),
  checkIn: (id) => axiosClient.post(`/bookings/${id}/check-in`),
  startWashing: (id) => axiosClient.post(`/bookings/${id}/start`),
  completeBooking: (id) => axiosClient.post(`/bookings/${id}/complete`),
};
