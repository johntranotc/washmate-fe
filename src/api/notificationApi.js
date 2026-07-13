import axiosClient from "./axiosClient";

export const notificationApi = {
  // BE phân trang mặc định size=10 → truyền size lớn để trang Thông báo thấy đủ danh sách.
  getNotifications: (params = {}) =>
    axiosClient.get("/v1/notifications", { params: { page: 0, size: 100, ...params } }),
  markNotificationAsRead: (id) => axiosClient.patch(`/v1/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch("/v1/notifications/read-all"),
};
