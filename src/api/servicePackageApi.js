import axiosClient from "./axiosClient";

export const servicePackageApi = {
  getAll: (garageId) =>
    axiosClient.get("/service-packages", { params: { garageId } }),
  getById: (id) => axiosClient.get(`/service-packages/${id}`),
  create: (payload) => axiosClient.post("/service-packages", payload),
  update: (id, payload) =>
    axiosClient.put(`/service-packages/${id}`, payload),
  remove: (id) => axiosClient.delete(`/service-packages/${id}`),
};
