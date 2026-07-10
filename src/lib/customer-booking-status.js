// Logic nghiệp vụ (dẫn xuất trạng thái) cho trang "Lịch đặt rửa xe" của khách hàng.
// KHÔNG chứa dữ liệu — chỉ suy ra hành động/nhóm từ trạng thái THẬT của booking đã chuẩn hoá.
// Nguồn enum: src/lib/status-tones.js. Nguồn booking: bookingApi.getMyBookings() → normalizeBooking.

// Trạng thái kết thúc (không còn hành động thanh toán/theo dõi tiến trình).
export const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"];
// Gara đã xác nhận và xe đang trong quy trình phục vụ.
export const IN_SERVICE_STATUSES = ["CHECKED_IN", "WASHING", "IN_PROGRESS"];
// Các trạng thái mà gara ĐÃ xác nhận → được phép thanh toán nếu chưa trả.
export const CONFIRMED_UNPAID_STATUSES = ["CONFIRMED", "PAYMENT_PENDING", ...IN_SERVICE_STATUSES];

export const isPaid = (b) => b?.paymentStatus === "PAID";
export const isAwaitingConfirm = (b) => b?.bookingStatus === "PENDING";
export const isRejected = (b) => b?.bookingStatus === "REJECTED";
export const isCancelled = (b) => b?.bookingStatus === "CANCELLED";
export const isCompleted = (b) => b?.bookingStatus === "COMPLETED";
export const isInService = (b) => IN_SERVICE_STATUSES.includes(b?.bookingStatus);
export const isTerminal = (b) => TERMINAL_STATUSES.includes(b?.bookingStatus);
const isPaymentClosed = (b) => b?.paymentStatus === "REFUNDED" || b?.paymentStatus === "CANCELLED";

/**
 * Chỉ cho phép "Thanh toán ngay" khi:
 *  - gara ĐÃ xác nhận (không còn PENDING/REJECTED/CANCELLED)
 *  - và thanh toán chưa hoàn tất (chưa PAID, chưa hoàn/hủy)
 * Endpoint thanh toán thật tồn tại (CustomerPaymentPage /khach-hang/thanh-toan/:id).
 */
export function canPay(b) {
  if (!b || isPaid(b) || isPaymentClosed(b) || isTerminal(b)) return false;
  return CONFIRMED_UNPAID_STATUSES.includes(b.bookingStatus);
}

/** Hóa đơn chỉ có khi đã thanh toán thành công (route .../hoa-don). */
export const canViewInvoice = (b) => isPaid(b);

/** Mốc thời gian (ms) của lịch để sắp xếp/so ngày; 0 nếu thiếu ngày thật. */
export function bookingTimeValue(b) {
  const raw = b?.bookingDate ? String(b.bookingDate).slice(0, 10) : "";
  if (!raw) return 0;
  const time = /^\d{2}:\d{2}/.test(b?.slotTime || "") ? b.slotTime : "00:00";
  const ms = new Date(`${raw}T${time}:00`).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Lịch "sắp tới": còn hiệu lực (chưa kết thúc) và ngày hẹn từ hôm nay trở đi. */
export function isUpcoming(b) {
  if (!b || isTerminal(b)) return false;
  const t = bookingTimeValue(b);
  if (!t) return false;
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  return day.getTime() >= startOfToday();
}

/** Booking cần khách hành động: (1) thanh toán được, hoặc (2) đang chờ gara xác nhận. */
export function needsAttention(b) {
  return canPay(b) || isAwaitingConfirm(b);
}

/**
 * Bộ hành động hiển thị cho một booking — thống nhất giữa list, khối "Cần xử lý" và drawer.
 * pay: được thanh toán ngay | invoice: xem hóa đơn | rebook: đặt lại | note: dòng nhắc trạng thái.
 */
export function deriveBookingActions(b) {
  return {
    pay: canPay(b),
    invoice: canViewInvoice(b),
    rebook: isCompleted(b) || isRejected(b),
    awaitingConfirm: isAwaitingConfirm(b),
    rejected: isRejected(b),
  };
}

// Định nghĩa tab trạng thái — count lấy từ dữ liệu thật, không tạo trạng thái giả.
export const BOOKING_TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "upcoming", label: "Sắp tới", match: isUpcoming },
  { key: "pending", label: "Chờ xác nhận", match: isAwaitingConfirm },
  { key: "unpaid", label: "Chờ thanh toán", match: canPay },
  { key: "washing", label: "Đang rửa xe", match: isInService },
  { key: "completed", label: "Hoàn thành", match: isCompleted },
  {
    key: "cancelled",
    label: "Đã hủy",
    match: (b) => isCancelled(b) || isRejected(b) || b?.bookingStatus === "NO_SHOW",
  },
];
