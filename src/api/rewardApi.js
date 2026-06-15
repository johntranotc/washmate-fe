import axiosClient from "./axiosClient";

export const rewardApi = {
  getRewards: (garageId) =>
    axiosClient.get("/loyalty/rewards", { params: { garageId } }),
  redeemReward: (rewardId, payload = {}) =>
    axiosClient.post(`/loyalty/rewards/${rewardId}/redeem`, payload),
};
