import axiosClient from "./axiosClient";

export const analyticsApi = {
  getCustomerSummary: () => axiosClient.get("/analytics/summary"),
};
