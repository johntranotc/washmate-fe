import axiosClient from "./axiosClient";

export const vehicleApi = {
  getMyVehicles: () => axiosClient.get("/vehicles"),
  createVehicle: (payload) => axiosClient.post("/vehicles", payload),
  updateVehicle: (id, payload) => axiosClient.put(`/vehicles/${id}`, payload),
  deleteVehicle: (id) => axiosClient.delete(`/vehicles/${id}`),
};
