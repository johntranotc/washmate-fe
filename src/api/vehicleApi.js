import axiosClient from "./axiosClient";

export const vehicleApi = {
  getMyVehicles: () => {
    return axiosClient.get("/v1/vehicles/my-vehicles");
  },

  getVehicleById: (id) => {
    return axiosClient.get(`/v1/vehicles/${id}`);
  },

  createVehicle: (payload) => {
    let userId = payload?.userId;
    if (!userId) {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        userId = user?.id || user?.userId || 1;
      } catch {}
    }
    return axiosClient.post("/v1/vehicles", { ...payload, userId: userId || 1 });
  },

  updateVehicle: (id, payload) => {
    return axiosClient.put(`/v1/vehicles/${id}`, payload);
  },

  deleteVehicle: (id) => {
    return axiosClient.delete(`/v1/vehicles/${id}`);
  },

  activateVehicle: (id) => {
    return axiosClient.put(`/v1/vehicles/${id}`, {
      status: "ACTIVE",
    });
  },

  deactivateVehicle: (id) => {
    return axiosClient.put(`/v1/vehicles/${id}`, {
      status: "INACTIVE",
    });
  },
};
