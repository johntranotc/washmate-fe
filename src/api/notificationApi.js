import axiosClient from "./axiosClient";

export const notificationApi = {
  getNotifications: () => axiosClient.get("/notifications"),
  getMine: () => axiosClient.get("/notifications"),
  markNotificationAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.put("/notifications/read-all"),
};
