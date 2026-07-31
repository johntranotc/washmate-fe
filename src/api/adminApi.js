import axiosClient from "./axiosClient";

export const adminApi = {
  // GET /api/v1/garages
  getGarages: () => axiosClient.get("/v1/garages"),
  // GET /api/admin/users (paginated)
  getAllUsers: (params = {}) => axiosClient.get("/admin/users", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // GET /api/bookings (paginated, all roles)
  getBookings: (params = {}) => axiosClient.get("/bookings", { params: { size: 1000, sort: 'id,desc', ...params } }),
  // PUT /api/admin/users/{userId}/status
  updateUserStatus: (userId, payload) => axiosClient.put(`/admin/users/${userId}/status`, payload),
  // POST /api/admin/staff — tạo tài khoản STAFF/MANAGER và gán chi nhánh
  // payload: { email, password, fullName, phone, role, garageIds } → MeResponse
  createStaff: (payload) => axiosClient.post("/admin/staff", payload),
  // PUT /api/admin/staff/{userId}/assignment — đổi vai trò + danh sách chi nhánh (thay thế toàn bộ)
  // payload: { role, garageIds } → MeResponse
  updateStaffAssignment: (userId, payload) => axiosClient.put(`/admin/staff/${userId}/assignment`, payload),
  // GET /api/v1/services/garage/{garageId}
  getServicesByGarage: (garageId) => axiosClient.get(`/v1/services/garage/${garageId}`),
  // GET /api/analytics/summary (ADMIN/OWNER) — số liệu tổng hợp thật từ BE
  getAnalyticsSummary: () => axiosClient.get("/analytics/summary"),
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
  // POST /api/owner/insights/{id}/campaign/preview — AI soạn nháp email + đề xuất voucher (read-only)
  // → { targetCount, subject, body, suggestedDiscountType, suggestedDiscountValue }
  previewInsightCampaign: (id) => axiosClient.post(`/owner/insights/${id}/campaign/preview`),
  // POST /api/owner/insights/{id}/campaign/send — tạo voucher + gửi mail hàng loạt
  // payload: { garageId, discountType, discountValue, voucherValidDays, subject, body } → { sentCount }
  sendInsightCampaign: (id, payload) => axiosClient.post(`/owner/insights/${id}/campaign/send`, payload),
};
