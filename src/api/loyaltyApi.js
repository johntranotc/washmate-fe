import axiosClient from "./axiosClient";

export const loyaltyApi = {
  getMyAccount: (garageId) =>
    axiosClient.get("/loyalty/accounts/me", { params: { garageId } }),
  getTransactions: (accountId) =>
    axiosClient.get(`/loyalty/accounts/${accountId}/transactions`),
  getRewards: (garageId) =>
    axiosClient.get("/loyalty/rewards", { params: { garageId } }),
  redeem: (rewardId, payload) =>
    axiosClient.post(`/loyalty/rewards/${rewardId}/redeem`, payload),
  adjustPoints: (accountId, payload) =>
    axiosClient.post(`/loyalty/accounts/${accountId}/adjust`, payload),
};
