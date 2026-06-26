import axiosClient from "./axiosClient";

export const getAdminAiInsights = ({ garageId, period }) => {
  return axiosClient.get("/admin/insights", {
    params: { garageId, period },
  });
};

export const generateAdminAiInsights = ({ garageId, period }) => {
  return axiosClient.post("/admin/insights/generate", null, {
    params: { garageId, period },
  });
};
