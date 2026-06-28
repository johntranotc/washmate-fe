export const unwrapObject = (payload) => {
  if (!payload || typeof payload !== "object") return {};
  return payload.data || payload.result || payload.content || payload;
};

export const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const value = unwrapObject(payload);
  if (Array.isArray(value)) return value;
  return value.items || value.content || value.results || value.data || [];
};

export const resolveTierInfo = (pointsInput = 0, backendTierName = null) => {
  const pts = Number(pointsInput) || 0;

  let normalizedBackendName = null;
  if (backendTierName) {
    const upper = String(backendTierName).toUpperCase().trim();
    if (upper === "SILVER" || upper === "BẠC") normalizedBackendName = "Bạc";
    else if (upper === "GOLD" || upper === "VÀNG") normalizedBackendName = "Vàng";
    else if (upper === "PLATINUM" || upper === "BẠCH KIM") normalizedBackendName = "Bạch Kim";
    else if (upper === "DIAMOND" || upper === "KIM CƯƠNG") normalizedBackendName = "Kim Cương";
    else if (upper === "BRONZE" || upper === "ĐỒNG" || upper === "NEW" || upper.includes("THÀNH VIÊN")) normalizedBackendName = "Đồng";
  }

  if (pts >= 8000 || normalizedBackendName === "Kim Cương") {
    return { tierCode: "DIAMOND", tierName: "Kim Cương", nextTierCode: "DIAMOND", nextTierName: "Kim Cương", pointsToNextTier: 0, progressPercent: 100 };
  }
  if (pts >= 3500 || normalizedBackendName === "Bạch Kim") {
    const needed = Math.max(0, 8000 - pts);
    return { tierCode: "PLATINUM", tierName: "Bạch Kim", nextTierCode: "DIAMOND", nextTierName: "Kim Cương", pointsToNextTier: needed, progressPercent: Math.min(100, Math.round(((pts - 3500) / 4500) * 100)) };
  }
  if (pts >= 1500 || normalizedBackendName === "Vàng") {
    const needed = Math.max(0, 3500 - pts);
    return { tierCode: "GOLD", tierName: "Vàng", nextTierCode: "PLATINUM", nextTierName: "Bạch Kim", pointsToNextTier: needed, progressPercent: Math.min(100, Math.round(((pts - 1500) / 2000) * 100)) };
  }
  if (pts >= 500 || normalizedBackendName === "Bạc") {
    const needed = Math.max(0, 1500 - pts);
    return { tierCode: "SILVER", tierName: "Bạc", nextTierCode: "GOLD", nextTierName: "Vàng", pointsToNextTier: needed, progressPercent: Math.min(100, Math.round(((pts - 500) / 1000) * 100)) };
  }
  const needed = Math.max(0, 500 - pts);
  return { tierCode: "BRONZE", tierName: "Đồng", nextTierCode: "SILVER", nextTierName: "Bạc", pointsToNextTier: needed, progressPercent: Math.min(100, Math.round((pts / 500) * 100)) };
};

export const normalizeLoyalty = (payload) => {
  const item = unwrapObject(payload);
  const availablePoints = Number(item.availablePoints ?? item.pointsBalance ?? item.points ?? 0);
  const totalEarnedPoints = Number(item.totalEarnedPoints ?? item.totalPoints ?? item.lifetimePoints ?? availablePoints);
  const totalRedeemedPoints = Number(item.totalRedeemedPoints ?? item.usedPoints ?? 0);

  const calculated = resolveTierInfo(availablePoints, item.tierName || item.tier || item.tierCode);

  return {
    id: item.accountId ?? item.id,
    availablePoints,
    totalEarnedPoints,
    totalRedeemedPoints,
    tier: calculated.tierCode,
    tierName: calculated.tierName,
    nextTier: calculated.nextTierCode,
    nextTierName: calculated.nextTierName,
    pointsToNextTier: calculated.pointsToNextTier,
    progressPercent: calculated.progressPercent,
  };
};

export const normalizeTransactions = (payload) =>
  unwrapList(payload).map((item, index) => ({
    id: item.transactionId ?? item.id ?? `transaction-${index}`,
    type: item.type ?? item.transactionType ?? "ADJUSTMENT",
    points: Number(item.points ?? item.pointAmount ?? item.amount ?? 0),
    description: item.description ?? item.reason ?? "Cập nhật điểm thưởng",
    createdAt: item.createdAt ?? item.transactionDate ?? new Date().toISOString(),
  }));

export const normalizePromotions = (payload) =>
  unwrapList(payload).map((item, index) => ({
    id: item.promotionId ?? item.id ?? `promotion-${index}`,
    code: item.code ?? item.promotionCode ?? "",
    title: item.title ?? item.name ?? "Ưu đãi WashMate",
    description: item.description ?? item.content ?? "",
    discountLabel:
      item.discountLabel ??
      (item.discountPercent ? `Giảm ${item.discountPercent}%` : item.discountAmount ? `Giảm ${Number(item.discountAmount).toLocaleString("vi-VN")}đ` : "Ưu đãi"),
    status: item.status ?? (item.memberOnly ? "MEMBER" : "ACTIVE"),
    memberOnly: Boolean(item.memberOnly ?? item.loyaltyOnly),
    expiresAt: item.expiresAt ?? item.endDate ?? item.validTo,
  }));

export const normalizeRewards = (payload) =>
  unwrapList(payload).map((item, index) => ({
    id: item.rewardId ?? item.id ?? `reward-${index}`,
    name: item.name ?? item.rewardName ?? "Quà tặng WashMate",
    description: item.description ?? "",
    pointsRequired: Number(item.pointsRequired ?? item.requiredPoints ?? item.points ?? 0),
    stock: item.stock ?? item.quantity ?? null,
  }));

export const normalizeNotifications = (payload) =>
  unwrapList(payload).map((item, index) => ({
    id: item.notificationId ?? item.id ?? `notification-${index}`,
    title: item.title ?? "Thông báo WashMate",
    message: item.message ?? item.content ?? "",
    type: item.type ?? item.category ?? "SYSTEM",
    read: Boolean(item.read ?? item.isRead),
    createdAt: item.createdAt ?? item.sentAt ?? new Date().toISOString(),
    link: item.link ?? item.actionUrl,
  }));

export const normalizeSummary = (payload) => {
  const item = unwrapObject(payload);
  return {
    totalSpent: Number(item.totalSpent ?? item.totalAmount ?? 0),
    completedBookings: Number(item.completedBookings ?? item.completedCount ?? 0),
    favoriteService: item.favoriteService ?? item.topService ?? "Chưa có dữ liệu",
  };
};

export const tierLabels = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  DIAMOND: "Kim Cương",
  PLATINUM: "Bạch Kim",
  NEW: "Đồng",
};

// Map mã hạng loyalty sang tên hạng dùng cho huy hiệu trang /tiers
export const tierCodeToBadgeName = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch Kim",
  DIAMOND: "Kim Cương",
  NEW: "Đồng",
};

export const loyaltyTransactionLabels = {
  EARN: "Tích điểm",
  REDEEM: "Đổi thưởng",
  ADJUSTMENT: "Điều chỉnh",
  ROLLBACK: "Hoàn điểm",
};
