import axiosClient from "./axiosClient";

export const servicePackageApi = {
  getAll: (garageId) =>
    axiosClient.get(`/v1/services/garage/${garageId}`),
  getById: (id) => axiosClient.get(`/v1/services/${id}`),
  create: (payload) => axiosClient.post("/v1/services", payload),
  update: (id, payload) =>
    axiosClient.put(`/v1/services/${id}`, payload),
  remove: (id) => axiosClient.delete(`/v1/services/${id}`),
};
