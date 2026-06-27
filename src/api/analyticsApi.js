import axiosClient from "./axiosClient";

export const analyticsApi = {
  getCustomerSummary: () => axiosClient.get("/v1/analytics/summary"),
};
