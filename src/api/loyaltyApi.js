import axiosClient from "./axiosClient";

// TODO(BE): Chưa có endpoint tổng quan tích điểm cấp chủ doanh nghiệp/chi nhánh, ví dụ:
//   GET /api/v1/loyalty/owner/summary  -> { totalIssued, totalUsed, totalRemaining, customersWithPoints }
//   GET /api/v1/loyalty/owner/tier-distribution?garageId -> [{ tier, customerCount }]
// Khi có, wire vào AdminDashboardPage thay cho việc suy ra từ users (hiện hiển thị "—" nếu thiếu).

export const loyaltyApi = {
  getMyLoyalty: (garageId) =>
    axiosClient.get("/loyalty/me", { params: { garageId } }),
  getMyAccount: (garageId) =>
    axiosClient.get("/loyalty/me", { params: { garageId } }),
  getLoyaltyTransactions: (accountId) =>
    axiosClient.get("/loyalty/transactions", { params: { accountId } }),
  getTransactions: (accountId) =>
    axiosClient.get("/loyalty/transactions", { params: { accountId } }),
  getRewards: (garageId) =>
    axiosClient.get("/v1/rewards", { params: { garageId } }),
  redeem: (rewardId, payload) =>
    axiosClient.post(`/v1/rewards/${rewardId}/redeem`, payload),
  adjustPoints: (accountId, payload) =>
    axiosClient.post(`/v1/customer/loyalty/adjust`, payload),
  // GET /api/v1/admin/loyalty-tiers — LƯU Ý: DTO của BE hiện là stub rỗng,
  // response về dạng [{}] không có field. FE gọi để thăm dò; không dùng được
  // thì hiển thị cấu hình nghiệp vụ + báo chờ API.
  getAdminTiers: () => axiosClient.get("/v1/admin/loyalty-tiers"),
};
