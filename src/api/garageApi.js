import axiosClient from "./axiosClient";

export const garageApi = {
  getAll: () => axiosClient.get("/v1/garages"),
  getById: (id) => axiosClient.get(`/v1/garages/${id}`),
};
