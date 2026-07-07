// Nguồn DUY NHẤT cho màu + label của trạng thái booking/payment trên cả 3 portal.
// Quy tắc: mỗi trạng thái nghiệp vụ = 1 cặp semantic token (DESIGN.md §3),
// mọi badge đi qua components/shared/StatusBadge.jsx — không tự chế tone map mới.

export const bookingStatusLabels = {
  PENDING: "Chờ gara xác nhận",
  CONFIRMED: "Đã xác nhận",
  PAYMENT_PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa xe",
  IN_PROGRESS: "Đang rửa xe",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Gara từ chối",
  NO_SHOW: "Không đến",
};

export const paymentStatusLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy thanh toán",
  REFUNDED: "Đã hoàn tiền",
  NOT_ISSUED: "Chưa phát hành",
};

// CANCELLED = muted (hủy là trung tính, không phải lỗi);
// REFUNDED = primary-container (thông tin, không phải success/xám).
export const bookingStatusTones = {
  PENDING: "bg-warning-container text-warning",
  CONFIRMED: "bg-primary-container text-primary-strong",
  PAYMENT_PENDING: "bg-warning-container text-warning",
  PAID: "bg-success-container text-success",
  CHECKED_IN: "bg-accent-cyan/15 text-accent-cyan",
  WASHING: "bg-accent-violet/15 text-accent-violet",
  IN_PROGRESS: "bg-accent-violet/15 text-accent-violet",
  COMPLETED: "bg-success-container text-success",
  CANCELLED: "bg-muted text-muted-foreground",
  REJECTED: "bg-critical-container text-critical",
  NO_SHOW: "bg-no-show-container text-no-show",
};

export const paymentStatusTones = {
  PENDING: "bg-warning-container text-warning",
  PAID: "bg-success-container text-success",
  FAILED: "bg-critical-container text-critical",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-primary-container text-primary-strong",
  NOT_ISSUED: "bg-muted text-muted-foreground",
};

export const NEUTRAL_TONE = "bg-muted text-muted-foreground";

// ===== Vai trò & trạng thái tài khoản (dùng chung Staff + Admin portal) =====
// Nguồn duy nhất để map enum role/UserStatus của BE sang tiếng Việt.

export const userRoleLabels = {
  ADMIN: "Quản trị viên",
  OWNER: "Chủ hệ thống",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

export const userRoleTones = {
  ADMIN: "bg-accent-violet/10 text-accent-violet",
  OWNER: "bg-accent-indigo/10 text-accent-indigo",
  MANAGER: "bg-primary-container text-primary",
  STAFF: "bg-accent-cyan/10 text-accent-cyan",
  CUSTOMER: NEUTRAL_TONE,
};

export const userStatusLabels = {
  ACTIVE: "Đang hoạt động",
  BLOCKED: "Tạm khóa",
  INACTIVE: "Ngừng hoạt động",
  PENDING_VERIFY: "Chờ kích hoạt",
};

export const userStatusTones = {
  ACTIVE: "bg-success-container text-success",
  BLOCKED: "bg-critical-container text-critical",
  INACTIVE: NEUTRAL_TONE,
  PENDING_VERIFY: "bg-warning-container text-warning",
};

/** Nhãn tiếng Việt cho role; không bao giờ trả enum thô ra UI. */
export function userRoleLabel(role, fallback = "—") {
  if (!role) return fallback;
  return userRoleLabels[String(role).toUpperCase()] || fallback;
}

/** Nhãn tiếng Việt cho trạng thái tài khoản. */
export function userStatusLabel(status, fallback = "—") {
  if (!status) return fallback;
  return userStatusLabels[String(status).toUpperCase()] || fallback;
}
