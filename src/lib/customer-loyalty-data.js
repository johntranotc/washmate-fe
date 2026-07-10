// Chuẩn hoá + logic loyalty cho trang "Điểm thành viên".
// Nguồn THẬT: /api/loyalty/me (account), /api/v1/customer/loyalty/tiers, /policy,
// /api/loyalty/transactions, /api/v1/rewards/all/{garageId}. Không hardcode ngưỡng/tier/quà.

function unwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return payload;
  return payload.data ?? payload.result ?? payload.content ?? payload;
}

function asArray(payload) {
  const v = unwrap(payload);
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.content)) return v.content;
  return [];
}

/** Chọn tài khoản loyalty chính (nhiều gara → lấy tài khoản nhiều điểm tích lũy nhất). */
export function normalizeLoyaltyAccount(payload) {
  const list = asArray(payload);
  const source = list.length ? list : (unwrap(payload) && !Array.isArray(unwrap(payload)) ? [unwrap(payload)] : []);
  if (!source.length) return null;
  const primary = [...source].sort(
    (a, b) => Number(b?.totalPoints || 0) - Number(a?.totalPoints || 0),
  )[0];
  if (!primary || primary.accountId == null) return null;
  const availablePoints = Number(primary.availablePoints ?? 0);
  const totalPoints = Number(primary.totalPoints ?? availablePoints);
  return {
    id: primary.accountId,
    garageId: primary.garageId ?? null,
    garageName: primary.garageName ?? "",
    tierId: primary.tierId ?? null,
    tierName: primary.tierName ?? "",
    tierMinPoints: primary.tierMinPoints != null ? Number(primary.tierMinPoints) : null,
    tierDiscountPercentage:
      primary.tierDiscountPercentage != null ? Number(primary.tierDiscountPercentage) : null,
    availablePoints,
    totalPoints,
    usedPoints: Math.max(0, totalPoints - availablePoints),
  };
}

/** Danh sách hạng thật, chỉ hạng ACTIVE, sắp xếp theo điểm yêu cầu tăng dần. */
export function normalizeTiers(payload) {
  return asArray(payload)
    .map((t) => ({
      id: t.tierId ?? t.id ?? null,
      name: t.tierName ?? "",
      minPoints: Number(t.minPoints ?? t.tierMinPoints ?? 0),
      maintainPoints: t.maintainPoints != null ? Number(t.maintainPoints) : null,
      discountPercentage: t.discountPercentage != null ? Number(t.discountPercentage) : null,
      status: t.status || "ACTIVE",
    }))
    .filter((t) => t.name && String(t.status).toUpperCase() !== "DELETED")
    .sort((a, b) => a.minPoints - b.minPoints);
}

/**
 * Tiến độ lên hạng từ ngưỡng THẬT. Dùng totalPoints (điểm tích lũy) để không bị tụt hạng khi đổi quà.
 * Trả hasData=false nếu không có danh sách hạng thật.
 */
export function computeTierProgress(account, tiers) {
  if (!account) return { hasData: false };
  if (!tiers?.length) return { hasData: false, currentName: account.tierName || "" };
  const points = Number(account.totalPoints || 0);

  let currentIdx = tiers.findIndex((t) => account.tierId != null && t.id === account.tierId);
  if (currentIdx < 0) {
    currentIdx = tiers.findIndex(
      (t) => account.tierName && t.name.toLowerCase() === account.tierName.toLowerCase(),
    );
  }
  if (currentIdx < 0) {
    // Suy từ điểm: hạng cao nhất có minPoints <= điểm hiện tại.
    for (let i = 0; i < tiers.length; i += 1) if (points >= tiers[i].minPoints) currentIdx = i;
    if (currentIdx < 0) currentIdx = 0;
  }

  const current = tiers[currentIdx];
  const next = tiers[currentIdx + 1] || null;
  if (!next) {
    return { hasData: true, current, next: null, isMax: true, pointsToNext: 0, progressPercent: 100 };
  }
  const span = Math.max(1, next.minPoints - current.minPoints);
  const gained = Math.max(0, points - current.minPoints);
  return {
    hasData: true,
    current,
    next,
    isMax: false,
    pointsToNext: Math.max(0, next.minPoints - points),
    progressPercent: Math.min(100, Math.round((gained / span) * 100)),
  };
}

// ---- Giao dịch điểm ----

export const TXN_META = {
  EARN: { label: "Tích điểm", sign: 1 },
  ROLLBACK: { label: "Hoàn điểm", sign: 1 },
  REDEEM: { label: "Đổi quà", sign: -1 },
  EXPIRE: { label: "Điểm hết hạn", sign: -1 },
};

function txnDescription(type, bookingId) {
  switch (type) {
    case "EARN":
      return bookingId ? "Tích điểm từ lịch rửa xe" : "Tích điểm";
    case "REDEEM":
      return "Đổi ưu đãi bằng điểm";
    case "ROLLBACK":
      return "Hoàn điểm";
    case "EXPIRE":
      return "Điểm hết hạn";
    default:
      return "Cập nhật điểm";
  }
}

/** Chuẩn hoá giao dịch — mô tả tiếng Việt theo loại (không dùng text tiếng Anh của BE). */
export function normalizeLoyaltyTransactions(payload) {
  return asArray(payload)
    .map((t, i) => {
      const type = String(t.type ?? t.transactionType ?? "EARN").toUpperCase();
      const meta = TXN_META[type] || { label: "Cập nhật", sign: 1 };
      const magnitude = Math.abs(Number(t.points ?? t.pointAmount ?? 0));
      return {
        id: t.id ?? t.transactionId ?? `txn-${i}`,
        type,
        label: meta.label,
        sign: meta.sign,
        points: magnitude,
        bookingId: t.bookingId ?? null,
        description: txnDescription(type, t.bookingId),
        createdAt: t.earnedAt || t.createdAt || t.transactionDate || "",
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ---- Quà / ưu đãi ----

export function normalizeRewards(payload) {
  return asArray(payload)
    .map((r) => ({
      id: r.rewardId ?? r.id ?? null,
      name: r.name ?? r.rewardName ?? "Ưu đãi WashMate",
      description: r.description ?? "",
      pointsRequired: Number(r.pointsRequired ?? r.requiredPoints ?? 0),
      stock: r.stock != null ? Number(r.stock) : null,
      status: String(r.status || "ACTIVE").toUpperCase(),
    }))
    .filter((r) => r.id != null && r.status !== "DELETED");
}

/** Trạng thái + hành động của 1 quà so với điểm khả dụng. */
export function rewardState(reward, availablePoints) {
  const avail = Number(availablePoints || 0);
  if (reward.status === "INACTIVE") return { key: "inactive", label: "Tạm ngưng", canRedeem: false };
  if (reward.status === "OUT_OF_STOCK" || reward.stock === 0)
    return { key: "out", label: "Đã hết lượt", canRedeem: false };
  const missing = reward.pointsRequired - avail;
  if (missing > 0)
    return { key: "insufficient", label: "Chưa đủ điểm", canRedeem: false, missing };
  return { key: "eligible", label: "Đủ điểm", canRedeem: true };
}

export const rewardIsActive = (r) => r.status === "ACTIVE" && r.stock !== 0;

// ---- Chính sách tích điểm (thật, nếu có) ----

export function normalizePolicy(payload) {
  const p = unwrap(payload);
  if (!p || typeof p !== "object" || p.policyId == null) return null;
  return {
    amountPerPoint: p.amountPerPoint != null ? Number(p.amountPerPoint) : null,
    pointExpiryMonths: p.pointExpiryMonths != null ? Number(p.pointExpiryMonths) : null,
    autoEnroll: Boolean(p.autoEnroll),
  };
}
