import axiosClient from "./axiosClient";

export const garageApi = {
  getAll: () => axiosClient.get("/garages"),
  getById: (id) => axiosClient.get(`/garages/${id}`),
};
