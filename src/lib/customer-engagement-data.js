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

export const normalizeLoyalty = (payload) => {
  const item = unwrapObject(payload);
  return {
    id: item.accountId ?? item.id,
    availablePoints: Number(item.availablePoints ?? item.pointsBalance ?? item.points ?? 0),
    totalEarnedPoints: Number(item.totalEarnedPoints ?? item.totalPoints ?? item.lifetimePoints ?? 0),
    totalRedeemedPoints: Number(item.totalRedeemedPoints ?? item.usedPoints ?? 0),
    tier: item.tierCode ?? item.tier ?? "BRONZE",
    tierName: item.tierName,
    nextTier: item.nextTierCode ?? item.nextTier,
    nextTierName: item.nextTierName,
    pointsToNextTier: Number(item.pointsToNextTier ?? item.remainingPoints ?? 0),
    progressPercent: Number(item.progressPercent ?? item.tierProgress ?? 0),
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
  DIAMOND: "Kim cương",
  PLATINUM: "Bạch kim",
};
