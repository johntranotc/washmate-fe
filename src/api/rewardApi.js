import axiosClient from "./axiosClient";

export const rewardApi = {
  getRewards: (garageId) =>
    axiosClient.get("/v1/rewards", { params: { garageId } }),
  redeemReward: (rewardId, payload = {}) =>
    axiosClient.post(`/v1/rewards/${rewardId}/redeem`, payload),
};
