// Chuẩn hoá ưu đãi (promotion) cho trang "Ưu đãi".
// Nguồn THẬT: GET /api/v1/promotion/AvailablePromotions?garageId (đã lọc sẵn ở BE:
// ACTIVE + trong hạn + còn lượt + khách CHƯA dùng). Entity chỉ có promoCode + discount + ngày
// + usage + minOrder — KHÔNG có name/description/tier → nhãn suy từ giá trị THẬT, không bịa.

const DAY = 86_400_000;
export const EXPIRING_DAYS = 7;

const fmtMoney = (n) => `${new Intl.NumberFormat("vi-VN").format(Number(n || 0))}đ`;

function toMs(value) {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Nhãn giá trị ưu đãi từ discountType/discountValue THẬT. */
export function discountLabel(promo) {
  if (promo.discountType === "PERCENTAGE") {
    return `Giảm ${Number(promo.discountValue)}%`;
  }
  return `Giảm ${fmtMoney(promo.discountValue)}`;
}

/** Tên ưu đãi suy từ giá trị thật (entity không có field name). */
export function promotionTitle(promo) {
  // Tiêu đề đồng đều (không kèm "tối đa …") để mọi thẻ cùng độ cao — mức tối đa đưa xuống mô tả.
  if (promo.discountType === "PERCENTAGE") {
    return `Giảm ${Number(promo.discountValue)}% phí dịch vụ`;
  }
  return `Giảm trực tiếp ${fmtMoney(promo.discountValue)}`;
}

export function promotionSubtitle(promo) {
  const parts = [];
  if (promo.discountType === "PERCENTAGE" && promo.maxDiscount > 0) {
    parts.push(`giảm tối đa ${fmtMoney(promo.maxDiscount)}`);
  }
  if (promo.minOrderValue > 0) parts.push(`đơn từ ${fmtMoney(promo.minOrderValue)}`);
  if (parts.length) {
    return `Áp dụng: ${parts.join(", ")}`;
  }
  return "Áp dụng cho dịch vụ tại WashMate";
}

export function normalizePromotion(raw, garageName = "") {
  if (!raw) return null;
  const type = String(raw.discountType || "").toUpperCase();
  const discountType = type.includes("PERCENT") ? "PERCENTAGE" : "FIXED_AMOUNT";
  const usageLimit = raw.usageLimit != null ? Number(raw.usageLimit) : null;
  const usedCount = Number(raw.usedCount || 0);
  const promo = {
    id: raw.promotionId ?? raw.id ?? raw.promoCode,
    code: (raw.promoCode || raw.code || "").toUpperCase(),
    garageId: raw.garageId ?? null,
    garageName: garageName || raw.garageName || "",
    discountType,
    discountValue: Number(raw.discountValue || 0),
    maxDiscount: raw.maxDiscount != null ? Number(raw.maxDiscount) : null,
    minOrderValue: Number(raw.minOrderValue || 0),
    usageLimit,
    remainingUses: usageLimit == null ? null : Math.max(0, usageLimit - usedCount),
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    status: raw.status || "ACTIVE",
  };
  return promo;
}

/** Số ngày còn lại tới hạn (null nếu không có endDate). */
export function daysLeft(promo) {
  if (!promo.endDate) return null;
  const diff = toMs(promo.endDate) - Date.now();
  return Math.ceil(diff / DAY);
}

export function isExpiringSoon(promo) {
  const d = daysLeft(promo);
  return d != null && d >= 0 && d <= EXPIRING_DAYS;
}

/** Danh sách ưu đãi khả dụng đều "có thể dùng" (BE đã lọc). Chỉ thêm cờ sắp hết hạn. */
export function promotionState(promo) {
  if (isExpiringSoon(promo)) {
    const d = daysLeft(promo);
    return { key: "expiring", label: d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày` };
  }
  return { key: "usable", label: "Có thể dùng" };
}

export const PROMO_TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "expiring", label: "Sắp hết hạn", match: isExpiringSoon },
  { key: "percent", label: "Giảm %", match: (p) => p.discountType === "PERCENTAGE" },
  { key: "fixed", label: "Giảm tiền", match: (p) => p.discountType === "FIXED_AMOUNT" },
];
