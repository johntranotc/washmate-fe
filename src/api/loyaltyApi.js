import axiosClient from "./axiosClient";

// Loyalty của KHÁCH dùng nhóm endpoint mới, principal lấy từ token:
//   GET /api/v1/customer/loyalty              -> LoyaltyAccountResponse (1 tài khoản)
//   GET /api/v1/customer/loyalty/transactions -> List<LoyaltyTransactionResponse>
//   GET /api/v1/customer/loyalty/summary?garageId -> CustomerLoyaltySummaryResponse (tiến độ hạng do BE tính)
//   GET /api/v1/customer/loyalty/tiers?garageId   -> List<LoyaltyTierResponse>
//   GET /api/v1/customer/loyalty/policy?garageId   -> LoyaltyPolicyResponse
export const loyaltyApi = {
  // Tài khoản điểm của tôi (BE lấy theo token).
  getMyLoyalty: () => axiosClient.get("/v1/customer/loyalty"),
  // Lịch sử tích/đổi điểm của tôi (BE lấy theo token).
  getLoyaltyTransactions: () => axiosClient.get("/v1/customer/loyalty/transactions"),
  // Tổng quan hạng + tiến độ lên/giữ hạng do BE tính sẵn theo gara.
  getSummary: (garageId) =>
    axiosClient.get("/v1/customer/loyalty/summary", { params: { garageId } }),
  // Danh sách hạng thành viên thật theo gara.
  getCustomerTiers: (garageId) =>
    axiosClient.get("/v1/customer/loyalty/tiers", { params: { garageId } }),
  // Chính sách tích điểm thật theo gara (amountPerPoint, pointExpiryMonths, autoEnroll).
  getPolicy: (garageId) =>
    axiosClient.get("/v1/customer/loyalty/policy", { params: { garageId } }),

  // ---- Admin: cấu hình hạng thành viên (/api/v1/admin/loyalty-tiers) ----
  getAdminTiers: (garageId) =>
    axiosClient.get("/v1/admin/loyalty-tiers", { params: { garageId } }),
  // body: LoyaltyTierRequest { tierName, minPoints, maintainPoints, discountPercentage } (+ garageId query)
  createTier: (garageId, payload) =>
    axiosClient.post("/v1/admin/loyalty-tiers", payload, { params: { garageId } }),
  updateTier: (id, payload) => axiosClient.put(`/v1/admin/loyalty-tiers/${id}`, payload),
  deleteTier: (id) => axiosClient.delete(`/v1/admin/loyalty-tiers/${id}`),

  // ---- Admin: chính sách tích điểm (/api/v1/admin/loyalty/policy) ----
  getAdminPolicy: (garageId) =>
    axiosClient.get("/v1/admin/loyalty/policy", { params: { garageId } }),
  // body: LoyaltyPolicyRequest { amountPerPoint, pointExpiryMonths, autoEnroll }
  createPolicy: (garageId, payload) =>
    axiosClient.post("/v1/admin/loyalty/policy", payload, { params: { garageId } }),
  updatePolicy: (garageId, payload) =>
    axiosClient.put("/v1/admin/loyalty/policy", payload, { params: { garageId } }),
  deletePolicy: (garageId) =>
    axiosClient.delete("/v1/admin/loyalty/policy", { params: { garageId } }),
};
