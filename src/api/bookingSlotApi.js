import axiosClient from "./axiosClient";

export const bookingSlotApi = {
  getAvailable: (params) => axiosClient.get("/booking-slots", { params }),
  getByGarage: (garageId, params) =>
    axiosClient.get(`/garages/${garageId}/booking-slots`, { params }),
  create: (payload) => axiosClient.post("/booking-slots", payload),
  update: (id, payload) => axiosClient.put(`/booking-slots/${id}`, payload),
  release: (id) => axiosClient.post(`/booking-slots/${id}/release`),
};
