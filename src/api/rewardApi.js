import axiosClient from "./axiosClient";

export const rewardApi = {
  getRewards: (garageId) =>
    axiosClient.get("/v1/rewards", { params: { garageId } }),
  // GET /api/v1/rewards/all/{garageId} - endpoint thật của BE cho danh sách ưu đãi theo gara
  getRewardsByGarage: (garageId) => axiosClient.get(`/v1/rewards/all/${garageId}`),
  redeemReward: (rewardId, payload = {}) =>
    axiosClient.post(`/v1/rewards/${rewardId}/redeem`, payload),
};
