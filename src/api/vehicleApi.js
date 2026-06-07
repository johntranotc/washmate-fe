import axiosClient from "./axiosClient";

export const vehicleApi = {
  getMyVehicles: () => {
    return axiosClient.get("/vehicles");
  },

  getVehicleById: (id) => {
    return axiosClient.get(`/vehicles/${id}`);
  },

  createVehicle: (payload) => {
    return axiosClient.post("/vehicles", payload);
  },

  updateVehicle: (id, payload) => {
    return axiosClient.put(`/vehicles/${id}`, payload);
  },

  deleteVehicle: (id) => {
    return axiosClient.delete(`/vehicles/${id}`);
  },

  activateVehicle: (id) => {
    return axiosClient.put(`/vehicles/${id}`, {
      status: "ACTIVE",
    });
  },

  deactivateVehicle: (id) => {
    return axiosClient.put(`/vehicles/${id}`, {
      status: "INACTIVE",
    });
  },
};
