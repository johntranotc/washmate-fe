import axiosClient from "./axiosClient";

export const promotionApi = {
  validate: (payload) => axiosClient.post("/promotions/validate", payload),
  getAll: (params) => axiosClient.get("/promotions", { params }),
  create: (payload) => axiosClient.post("/promotions", payload),
  update: (id, payload) => axiosClient.put(`/promotions/${id}`, payload),
};
