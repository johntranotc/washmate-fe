import axiosClient from "./axiosClient";

export const rewardApi = {
  getRewards: (garageId) =>
    axiosClient.get("/v1/rewards", { params: { garageId } }),
  // GET /api/v1/rewards/all/{garageId} - endpoint thật của BE cho danh sách ưu đãi theo gara
  // params hỗ trợ: { status, page, size, sort } (Page<RewardResponse>)
  getRewardsByGarage: (garageId, params = {}) =>
    axiosClient.get(`/v1/rewards/all/${garageId}`, { params: { size: 200, ...params } }),
  // GET /api/v1/rewards/{rewardId} — chi tiết 1 ưu đãi
  getRewardById: (rewardId) => axiosClient.get(`/v1/rewards/${rewardId}`),
  // POST /api/v1/rewards — body { garageId, name, description, pointsRequired, stock }
  createReward: (payload) => axiosClient.post("/v1/rewards", payload),
  // PUT /api/v1/rewards/{rewardId} — body { name, description, pointsRequired, stock, status }
  updateReward: (rewardId, payload) => axiosClient.put(`/v1/rewards/${rewardId}`, payload),
  redeemReward: (rewardId, payload = {}) =>
    axiosClient.post(`/v1/rewards/${rewardId}/redeem`, payload),
};
