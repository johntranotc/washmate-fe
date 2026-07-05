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
