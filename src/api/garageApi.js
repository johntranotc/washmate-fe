import axiosClient from "./axiosClient";

export const garageApi = {
  // GET /api/v1/garages
  getAll: () => axiosClient.get("/v1/garages"),
  // GET /api/v1/garages/{id}
  getById: (id) => axiosClient.get(`/v1/garages/${id}`),
  // POST /api/v1/garages
  create: (payload) => axiosClient.post("/v1/garages", payload),
  // PUT /api/v1/garages/{id}
  update: (id, payload) => axiosClient.put(`/v1/garages/${id}`, payload),
  // DELETE /api/v1/garages/{id}
  remove: (id) => axiosClient.delete(`/v1/garages/${id}`),
};
