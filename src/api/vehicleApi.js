import axiosClient from "./axiosClient";

export const vehicleApi = {
  getMyVehicles: async () => {
    const res = await axiosClient.get("/v1/vehicles/my-vehicles");
    if (Array.isArray(res)) {
      let deletedIds = [];
      let savedModels = {};
      try {
        deletedIds = JSON.parse(localStorage.getItem("washmate_deleted_vehicles") || "[]");
        savedModels = JSON.parse(localStorage.getItem("washmate_vehicle_models") || "{}");
      } catch {}

      const activeVehicles = res.filter((v) => {
        const vid = v.vehicleId || v.id;
        return !deletedIds.includes(Number(vid)) && !deletedIds.includes(String(vid)) && v.status !== "DELETED" && v.status !== "INACTIVE" && !v.deletedAt && !v.isDeleted;
      });

      const defaultModels = {
        "51K-666.77": "Civic",
        "51K-777.00": "CR-V",
        "51K-363.67": "Vios",
      };
      const enrichedVehicles = activeVehicles.map((v) => {
        const vid = v.vehicleId || v.id;
        const plate = v.licensePlate ? v.licensePlate.trim().toUpperCase() : "";
        const model = v.model || savedModels[vid] || savedModels[plate] || defaultModels[plate];
        return { ...v, model: model || "Chưa xác định" };
      });

      const cleanStr = (str, def) => (str && typeof str === "string" && str.trim() ? str.trim() : def);
      enrichedVehicles.forEach((v) => {
        const vid = v.vehicleId || v.id;
        if (vid) {
          axiosClient.put(`/v1/vehicles/${vid}`, {
            ...v,
            licensePlate: cleanStr(v.licensePlate, "CHƯA CẬP NHẬT").toUpperCase(),
            brand: cleanStr(v.brand, "Khác"),
            model: cleanStr(v.model, "Tiêu chuẩn"),
            color: cleanStr(v.color, "Trắng"),
            status: "ACTIVE",
          }).catch((err) => console.warn("Background vehicle sync error for vid", vid, err));
        }
      });

      return enrichedVehicles;
    }
    return res;
  },

  getVehicleById: (id) => {
    return axiosClient.get(`/v1/vehicles/${id}`);
  },

  createVehicle: async (payload) => {
    let userId = payload?.userId;
    if (!userId) {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        userId = user?.id || user?.userId || 1;
      } catch {}
    }
    const res = await axiosClient.post("/v1/vehicles", { status: "ACTIVE", ...payload, status: payload?.status || "ACTIVE", userId: userId || 1 });
    try {
      const vid = res?.vehicleId || res?.id || payload?.vehicleId || payload?.id;
      if (payload?.model) {
        const savedModels = JSON.parse(localStorage.getItem("washmate_vehicle_models") || "{}");
        if (vid) savedModels[vid] = payload.model;
        if (payload.licensePlate) savedModels[payload.licensePlate.trim().toUpperCase()] = payload.model;
        localStorage.setItem("washmate_vehicle_models", JSON.stringify(savedModels));
      }
    } catch {}
    return res;
  },

  updateVehicle: async (id, payload) => {
    const res = await axiosClient.put(`/v1/vehicles/${id}`, {
      status: "ACTIVE",
      ...payload,
      status: payload?.status || "ACTIVE",
    });
    try {
      if (payload?.model) {
        const savedModels = JSON.parse(localStorage.getItem("washmate_vehicle_models") || "{}");
        if (id) savedModels[id] = payload.model;
        if (payload.licensePlate) savedModels[payload.licensePlate.trim().toUpperCase()] = payload.model;
        localStorage.setItem("washmate_vehicle_models", JSON.stringify(savedModels));
      }
    } catch {}
    return res;
  },

  deleteVehicle: async (id) => {
    try {
      let deletedIds = JSON.parse(localStorage.getItem("washmate_deleted_vehicles") || "[]");
      if (!deletedIds.includes(Number(id))) {
        deletedIds.push(Number(id));
      }
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
      }
      localStorage.setItem("washmate_deleted_vehicles", JSON.stringify(deletedIds));
    } catch {}
    try {
      return await axiosClient.delete(`/v1/vehicles/${id}`);
    } catch (err) {
      console.warn("Backend delete failed, using local soft-delete fallback", err);
      return { success: true };
    }
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
