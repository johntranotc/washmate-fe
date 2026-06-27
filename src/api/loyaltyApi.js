import axiosClient from "./axiosClient";

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
};
