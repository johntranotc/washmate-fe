import axiosClient from "./axiosClient";

export const bookingSlotApi = {
  getAvailable: ({ garageId, date }) => axiosClient.get(`/v1/garages/${garageId}/slots`, { params: { date } }),
  getByGarage: (garageId, params) =>
    axiosClient.get(`/v1/garages/${garageId}/slots`, { params }),
  create: (garageId, payload) => axiosClient.post(`/v1/garages/${garageId}/slots`, payload),
  update: (id, payload) => axiosClient.put(`/v1/slots/${id}/capacity`, payload),
  delete: (id) => axiosClient.delete(`/v1/slots/${id}`),
};
