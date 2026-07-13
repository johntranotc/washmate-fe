import axiosClient from "./axiosClient";

export function normalizePromotion(item) {
  if (!item) return null;
  const code = item.code || item.promoCode || item.promotionCode || "";
  const rawType = String(item.discountType || "").toUpperCase();
  const isPercent = rawType.includes("PERCENT");
  const discountType = isPercent ? "PERCENTAGE" : "FIXED_AMOUNT";
  const discountValue = Number(item.discountValue || 0);
  const maxDiscount = item.maxDiscount != null ? Number(item.maxDiscount) : null;
  const minOrderValue = Number(item.minOrderValue || 0);
  const title =
    item.title ||
    item.name ||
    (isPercent
      ? `Giảm ${discountValue}% phí dịch vụ`
      : `Giảm trực tiếp ${discountValue.toLocaleString("vi-VN")}đ`);
  const description =
    item.description ||
    (minOrderValue > 0
      ? `Đơn tối thiểu ${minOrderValue.toLocaleString("vi-VN")}đ`
      : "Áp dụng cho dịch vụ tại hệ thống WashMate");

  return {
    ...item,
    id: item.id || item.promotionId || item.promoId || code,
    code: code.toUpperCase(),
    title,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    status: item.status || "ACTIVE",
  };
}

export const promotionApi = {
  // Ưu đãi khách có thể áp vào booking tại 1 gara — endpoint dành cho CUSTOMER,
  // trả về các mã khách đã đổi điểm và còn hiệu lực (chưa dùng).
  getAvailablePromotions: async (garageId) => {
    try {
      const res = await axiosClient.get("/v1/promotion/AvailablePromotions", {
        params: { garageId: garageId || 1 },
      });
      const list = Array.isArray(res) ? res : res?.data || res?.content || [];
      return list.map(normalizePromotion).filter(Boolean);
    } catch {
      return [];
    }
  },
  getPromotions: (params) => axiosClient.get("/v1/promotion/AvailablePromotions", { params }),

  // Ưu đãi theo mùa (không cần đổi điểm) — Admin CRUD /v1/admin/promotions
  adminGetAll: async (garageId) => {
    try {
      const res = await axiosClient.get("/v1/admin/promotions", {
        params: { garageId: garageId || undefined, size: 200 },
      });
      const list = Array.isArray(res)
        ? res
        : res?.content || res?.data?.content || res?.data || [];
      return list.map(normalizePromotion).filter(Boolean);
    } catch {
      return [];
    }
  },
  adminCreate: (payload) => axiosClient.post("/v1/admin/promotions", payload),
  adminUpdate: (id, payload) => axiosClient.put(`/v1/admin/promotions/${id}`, payload),
  adminDelete: (id) => axiosClient.delete(`/v1/admin/promotions/${id}`),
};

