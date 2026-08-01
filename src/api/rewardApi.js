import axiosClient from "./axiosClient";

// Ưu đãi đổi điểm = "promotion reward" của BE. BE tách 2 nhóm endpoint:
//   Khách:  /api/v1/customer/promotion-rewards        (xem + đổi bằng điểm)
//   Admin:  /api/v1/admin/promotion-rewards           (CRUD + lượt đổi)
// Trả về Page<RewardResponse> { rewardId, garageId, name, description, pointsRequired, stock, status }.

export const rewardApi = {
  // ---- Khách hàng ----
  // GET danh sách ưu đãi đổi điểm khả dụng tại 1 gara (Page<RewardResponse>).
  getCustomerRewards: (garageId, params = {}) =>
    axiosClient.get("/v1/customer/promotion-rewards", { params: { garageId, size: 200, ...params } }),
  // POST đổi ưu đãi bằng điểm — garageId là query param, principal lấy từ token.
  redeemReward: (rewardId, garageId) =>
    axiosClient.post(`/v1/customer/promotion-rewards/${rewardId}/redeem`, null, { params: { garageId } }),
  // GET lịch sử lượt đổi của tôi tại 1 gara.
  getMyRedemptions: (garageId, params = {}) =>
    axiosClient.get("/v1/customer/promotion-rewards/my-redemptions", { params: { garageId, size: 50, ...params } }),

  // ---- Admin ----
  // GET danh sách ưu đãi của gara (lọc status tuỳ chọn) — Page<RewardResponse>.
  getAdminRewards: (garageId, params = {}) =>
    axiosClient.get("/v1/admin/promotion-rewards", { params: { garageId, size: 200, ...params } }),
  // POST tạo ưu đãi đổi điểm mới. body: PromotionRewardCreateRequest
  //   { garageId, name, description, pointsRequired, stock, discountType, discountValue,
  //     maxDiscount?, minOrderValue, validDays }
  createReward: (payload) => axiosClient.post("/v1/admin/promotion-rewards", payload),
  // PUT cập nhật. body: PromotionRewardUpdateRequest
  //   { name, description, pointsRequired, stock, status, discountType, discountValue,
  //     maxDiscount?, minOrderValue, validDays }
  updateReward: (rewardId, payload) => axiosClient.put(`/v1/admin/promotion-rewards/${rewardId}`, payload),
  // DELETE ưu đãi.
  deleteReward: (rewardId) => axiosClient.delete(`/v1/admin/promotion-rewards/${rewardId}`),
  // GET lượt đổi thưởng của gara (lọc status tuỳ chọn) — Page<RewardRedemptionResponse>.
  getAdminRedemptions: (garageId, params = {}) =>
    axiosClient.get("/v1/admin/promotion-rewards/redemptions", { params: { garageId, size: 100, ...params } }),
};
