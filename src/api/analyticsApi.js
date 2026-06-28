import axiosClient from "./axiosClient";

export const analyticsApi = {
  getAnalyticsSummary: () => axiosClient.get("/v1/analytics/garage-owner/dashboard"),
  getCustomerBehavior: (params) => axiosClient.get("/v1/analytics/admin/behavioral-logs", { params }),
  getCustomerSegments: (params) => axiosClient.get("/v1/analytics/admin/customer-segments", { params }),
};
