import axiosClient from "./axiosClient";

/**
 * Unwrap nhiều dạng response phân trang từ BE:
 * - Array trực tiếp
 * - { content: [...] }   (Spring Page)
 * - { items: [...] }
 * - { data: [...] } hoặc { data: { content: [...] } }
 * - { result: [...] } hoặc { result: { content: [...] } }
 */
export function extractBookingArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.content)) return payload.data.content;
    if (Array.isArray(payload.data.items)) return payload.data.items;
  }
  if (Array.isArray(payload?.result)) return payload.result;
  if (payload?.result && typeof payload.result === "object") {
    if (Array.isArray(payload.result.content)) return payload.result.content;
  }
  return [];
}

export const staffApi = {
  // GET /api/bookings (all bookings — truyền size lớn để tránh bị phân trang cắt bớt)
  getAllBookings: (params = {}) =>
    axiosClient.get("/bookings", { params: { size: 1000, ...params } }),

  // GET /api/bookings?status=PENDING&size=500 — dành riêng cho queue xác nhận
  getPendingBookings: () =>
    axiosClient.get("/bookings", { params: { status: "PENDING", size: 500 } }),

  // GET /api/bookings?fromDate=today&toDate=today
  getTodayBookings: () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return axiosClient.get("/bookings", { params: { fromDate: dateStr, toDate: dateStr, size: 500 } });
  },

  // GET /api/bookings/{id}
  getStaffBookingById: (bookingId) => axiosClient.get(`/bookings/${bookingId}`),
  // POST /api/bookings/{id}/confirm
  confirmBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/confirm`),
  // POST /api/bookings/{id}/check-in
  checkInBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/check-in`),
  // POST /api/bookings/{id}/start-washing
  startWashing: (bookingId) => axiosClient.post(`/bookings/${bookingId}/start-washing`),
  // POST /api/bookings/{id}/complete
  completeBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/complete`),
  // POST /api/bookings/{id}/no-show
  markNoShow: (bookingId) => axiosClient.post(`/bookings/${bookingId}/no-show`),
  // POST /api/bookings/{id}/cancel
  cancelBooking: (bookingId) => axiosClient.post(`/bookings/${bookingId}/cancel`),
};
