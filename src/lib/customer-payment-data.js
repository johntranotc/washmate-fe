// Suy ra dữ liệu TÀI CHÍNH cho trang "Thanh toán & Hóa đơn" từ booking đã chuẩn hoá.
// Nguồn THẬT duy nhất: bookingApi.getMyBookings() (BookingResponse kèm payment + invoice).
// Không có endpoint list hóa đơn riêng; điều kiện thanh toán dùng lại customer-booking-status.

import { canPay, isAwaitingConfirm } from "./customer-booking-status";

export { canPay };

export const isPaidRecord = (b) => b?.paymentStatus === "PAID";
export const isFailedRecord = (b) => b?.paymentStatus === "FAILED";
export const isCancelledRecord = (b) =>
  ["CANCELLED", "REJECTED", "NO_SHOW"].includes(b?.bookingStatus) ||
  ["CANCELLED", "REFUNDED"].includes(b?.paymentStatus);

/** Đang chờ gara xác nhận (chưa thanh toán được) → đưa vào banner, không vào "Cần thanh toán". */
export const isAwaitingConfirmRecord = (b) => isAwaitingConfirm(b) && !isPaidRecord(b);

export const invoiceCodeOf = (b) => b?.invoice?.invoiceCode || b?.invoice?.code || "";
export const hasIssuedInvoice = (b) => Boolean(invoiceCodeOf(b)) || isPaidRecord(b);

/** Mốc thời gian (ms) của bản ghi tài chính: ưu tiên ngày phát hành HĐ → ngày thanh toán → ngày hẹn. */
export function recordTimeMs(b) {
  const raw =
    b?.invoice?.issuedAt || b?.payment?.paidAt || b?.payment?.paymentDate || b?.bookingDate || "";
  if (!raw) return 0;
  const iso = String(raw);
  const ms = new Date(iso.length <= 10 ? `${iso.slice(0, 10)}T00:00:00` : iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Ngày hiển thị (YYYY-MM-DD) cho một bản ghi tài chính — dùng formatBookingDate ở UI. */
export function recordDateRaw(b) {
  return (
    b?.invoice?.issuedAt || b?.payment?.paidAt || b?.payment?.paymentDate || b?.bookingDate || ""
  );
}

// Tab tài chính — count từ dữ liệu thật. "Thanh toán lỗi" chỉ thêm khi thực sự có bản ghi FAILED.
export function buildPaymentTabs(bookings) {
  const tabs = [
    { key: "all", label: "Tất cả", match: () => true },
    { key: "payable", label: "Cần thanh toán", match: canPay },
    { key: "paid", label: "Đã thanh toán", match: isPaidRecord },
    { key: "cancelled", label: "Đã hủy", match: isCancelledRecord },
  ];
  if (bookings.some(isFailedRecord)) {
    tabs.splice(3, 0, { key: "failed", label: "Thanh toán lỗi", match: isFailedRecord });
  }
  return tabs;
}

/** KPI tài chính — 100% từ bản ghi thật. */
export function buildPaymentKpi(bookings) {
  const payable = bookings.filter(canPay);
  const paid = bookings.filter(isPaidRecord);
  const totalSpent = paid.reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);
  const payableTotal = payable.reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);
  const latestPaid = paid.map(recordTimeMs).filter(Boolean).sort((a, b) => b - a)[0] || 0;
  return {
    payableCount: payable.length,
    payableTotal,
    paidCount: paid.length,
    totalSpent,
    latestPaidMs: latestPaid,
  };
}
