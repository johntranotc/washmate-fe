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
  // GET /api/analytics/summary (ADMIN/OWNER) — số liệu tổng hợp thật từ BE
  getAnalyticsSummary: () => axiosClient.get("/analytics/summary"),
  // Giữ alias cũ để tương thích (trỏ về endpoint thật)
  getAdminSummary: () => axiosClient.get("/analytics/summary"),
  // GET /api/admin/invoices (paginated)
  getInvoices: (params = {}) => axiosClient.get("/admin/invoices", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // GET /api/owner/insights (ADMIN/OWNER) — insight rule-based thật từ BE.
  // params: { fromDate, toDate, type?, status? } → AutoWashInsightsResponse
  // { period, summary, insights: BusinessInsightResponse[], analysisStatus, message }
  getOwnerInsights: (params = {}) => axiosClient.get("/owner/insights", { params }),
  // POST /api/owner/insights/generate — chạy lại phân tích rule-based cho kỳ
  generateInsights: (payload) => axiosClient.post("/owner/insights/generate", payload),
  // GET /api/owner/insight-rules — cấu hình rule thật (threshold, severity, active)
  getInsightRules: () => axiosClient.get("/owner/insight-rules"),
  // PATCH /api/owner/insight-rules/{id}
  updateInsightRule: (id, payload) => axiosClient.patch(`/owner/insight-rules/${id}`, payload),
  // POST /api/owner/insights/{id}/ai-enrich — gợi ý AI THẬT (Gemini phía BE)
  // → { aiSummary, aiExplanation, aiRecommendation: string[], confidenceScore, ... }
  aiEnrichInsight: (id) => axiosClient.post(`/owner/insights/${id}/ai-enrich`),
  // GET /api/owner/insights/ai-health → { configured, model, promptVersion, message }
  getAiHealth: () => axiosClient.get("/owner/insights/ai-health"),
  // POST /api/owner/insights/ai-chat — chat AI THẬT (Gemini phía BE)
  // body { question, insightId?, fromDate?, toDate? } → { answer, suggestedActions[] }
  aiChat: (payload) => axiosClient.post("/owner/insights/ai-chat", payload),
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
