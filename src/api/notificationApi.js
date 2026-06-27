import axiosClient from "./axiosClient";

export const notificationApi = {
  getNotifications: () => axiosClient.get("/v1/notifications"),
  getMine: () => axiosClient.get("/v1/notifications"),
  markNotificationAsRead: (id) => axiosClient.patch(`/v1/notifications/${id}/read`),
  markRead: (id) => axiosClient.patch(`/v1/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch("/v1/notifications/read-all"),
};
