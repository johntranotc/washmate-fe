// Chuẩn hoá + logic thông báo khách hàng.
// Nguồn THẬT: GET /api/v1/notifications (NotificationResponse: notificationId, bookingId,
// title, content, type, channel, status, isRead, createdAt, readAt).
// Không có field link → CTA suy từ type + bookingId THẬT. API chỉ có markRead + markAllRead.

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  return payload.data ?? payload.content ?? payload.results ?? [];
}

/** Nhóm nghiệp vụ suy từ chuỗi type (không cần enum cứng). */
export function notificationCategory(type) {
  const t = String(type || "").toUpperCase();
  if (t.includes("PAY")) return "payment";
  if (t.startsWith("BOOKING")) return "booking";
  if (t.startsWith("LOYALTY")) return "loyalty";
  if (t.includes("PROMO")) return "promotion";
  return "system";
}

export const CATEGORY_LABELS = {
  booking: "Đặt lịch",
  payment: "Thanh toán",
  loyalty: "Điểm thành viên",
  promotion: "Ưu đãi",
  system: "Hệ thống",
};

export const CATEGORY_TONES = {
  booking: "bg-primary-container text-primary",
  payment: "bg-warning-container text-warning",
  loyalty: "bg-success-container text-success",
  promotion: "bg-accent-violet/12 text-accent-violet",
  system: "bg-muted text-muted-foreground",
};

/** Thông báo cần khách hành động: liên quan thanh toán hoặc nhắc lịch. */
export function needsAction(n) {
  return n.category === "payment" || String(n.type || "").toUpperCase().includes("REMINDER");
}

/** CTA điều hướng đúng ngữ cảnh — chỉ dùng route thật đang có. */
export function notificationCta(n) {
  switch (n.category) {
    case "booking":
      return { label: "Xem lịch đặt", to: n.bookingId ? `/khach-hang/lich-dat/${n.bookingId}` : "/khach-hang/lich-dat" };
    case "payment":
      return { label: "Thanh toán ngay", to: n.bookingId ? `/khach-hang/thanh-toan/${n.bookingId}` : "/khach-hang/thanh-toan" };
    case "loyalty":
      return { label: "Xem điểm thưởng", to: "/khach-hang/diem-thanh-vien" };
    case "promotion":
      return { label: "Xem ưu đãi", to: "/khach-hang/uu-dai" };
    default:
      return null;
  }
}

export function normalizeNotification(raw, index = 0) {
  const type = raw.type ?? raw.category ?? "SYSTEM";
  return {
    id: raw.notificationId ?? raw.id ?? `noti-${index}`,
    title: raw.title ?? "Thông báo WashMate",
    message: raw.content ?? raw.message ?? "",
    type,
    category: notificationCategory(type),
    bookingId: raw.bookingId ?? null,
    read: Boolean(raw.isRead ?? raw.read),
    createdAt: raw.createdAt ?? raw.sentAt ?? "",
  };
}

export function normalizeNotificationList(payload) {
  return unwrapList(payload)
    .map(normalizeNotification)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Thời gian tương đối tiếng Việt. */
export function relativeTime(iso) {
  if (!iso) return "";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return new Date(ms).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

// Tab lọc — count từ dữ liệu thật.
export const NOTIFICATION_TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "unread", label: "Chưa đọc", match: (n) => !n.read },
  { key: "booking", label: "Đặt lịch", match: (n) => n.category === "booking" },
  { key: "payment", label: "Thanh toán", match: (n) => n.category === "payment" },
  { key: "loyalty", label: "Điểm thành viên", match: (n) => n.category === "loyalty" },
  { key: "promotion", label: "Ưu đãi", match: (n) => n.category === "promotion" },
  { key: "system", label: "Hệ thống", match: (n) => n.category === "system" },
];
