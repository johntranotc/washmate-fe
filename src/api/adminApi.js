import axiosClient from "./axiosClient";

export const adminApi = {
  // GET /api/v1/garages
  getGarages: () => axiosClient.get("/v1/garages"),
  // GET /api/admin/users (paginated)
  getAllUsers: (params = {}) => axiosClient.get("/admin/users", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // GET /api/bookings (paginated, all roles)
  getBookings: (params = {}) => axiosClient.get("/bookings", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // POST /api/bookings/{id}/cancel
  cancelBooking: (id) => axiosClient.post(`/bookings/${id}/cancel`),
  // PUT /api/admin/users/{userId}/status
  updateUserStatus: (userId, payload) => axiosClient.put(`/admin/users/${userId}/status`, payload),
  // DELETE /api/admin/users/{userId}
  deleteUser: (userId) => axiosClient.delete(`/admin/users/${userId}`),
  // GET /api/v1/services/garage/{garageId}
  getServicesByGarage: (garageId) => axiosClient.get(`/v1/services/garage/${garageId}`),
  // No admin-level analytics summary endpoint yet — return empty
  getAdminSummary: () => Promise.resolve({}),
  // GET /api/admin/invoices (paginated)
  getInvoices: (params = {}) => axiosClient.get("/admin/invoices", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // No list-all payments endpoint yet — return empty
  getPayments: () => Promise.resolve([]),
  // No reports endpoint yet
  getReports: () => Promise.resolve({}),
  // Compat aliases for AdminDataPage component
  getServicePackages: () => axiosClient.get("/v1/garages").then((res) => {
    const actualData = res?.data ? res.data : res;
    const list = Array.isArray(actualData) ? actualData : [];
    if (list.length === 0) return [];
    const firstId = list[0].id ?? list[0].garageId;
    if (!firstId) return [];
    return axiosClient.get(`/v1/services/garage/${firstId}`)
      .then(sRes => (sRes?.data ? sRes.data : sRes))
      .catch(() => []);
  }),
  getSlots: () => Promise.resolve([]),
};
