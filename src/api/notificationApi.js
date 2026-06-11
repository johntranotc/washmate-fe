import axiosClient from "./axiosClient";

export const notificationApi = {
  getMine: () => axiosClient.get("/notifications"),
  markRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.put("/notifications/read-all"),
};
