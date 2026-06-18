import { asList } from "./booking-flow";

export const bookingStatusLabels = {
  PENDING_STAFF_CONFIRMATION: "Chờ gara xác nhận",
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã được gara xác nhận",
  PAYMENT_PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa xe",
  COMPLETED: "Hoàn tất",
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
};

export const invoiceStatusLabels = {
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

export const paymentMethodLabels = {
  CASH: "Tiền mặt tại gara",
  BANK_TRANSFER: "Chuyển khoản",
  DOMESTIC_CARD: "Thẻ nội địa",
  CARD: "Thẻ nội địa",
  E_WALLET: "Ví điện tử",
};

function unwrap(value) {
  if (!value || typeof value !== "object") return value;
  if (value.data && !Array.isArray(value.data)) return unwrap(value.data);
  if (value.result && !Array.isArray(value.result)) return unwrap(value.result);
  return value;
}

export function normalizeBookingList(value) {
  return asList(value).map(normalizeBooking);
}

export function normalizeBooking(value) {
  const root = unwrap(value) || {};
  const item = unwrap(root.booking) || root;
  const payment = normalizePayment(item.payment || root.payment || {
    id: item.paymentId,
    status: item.paymentStatus,
    method: item.paymentMethod,
  });
  const backendStatus = item.bookingStatus || item.status || "PENDING_STAFF_CONFIRMATION";
  const bookingStatus =
    backendStatus === "PENDING_STAFF_CONFIRMATION" || backendStatus === "REJECTED"
      ? backendStatus
      : payment.status === "PAID"
        ? backendStatus === "PENDING"
          ? "CONFIRMED"
          : backendStatus
        : backendStatus === "CONFIRMED"
          ? "PENDING"
          : backendStatus;

  return {
    ...item,
    id: item.bookingId ?? item.id,
    code: item.bookingCode || item.code || `BK-${item.bookingId ?? item.id ?? "..."}`,
    bookingStatus,
    paymentStatus: payment.status,
    payment,
    vehicle: item.vehicle?.name || item.vehicleName || item.vehicle || "Xe của khách hàng",
    plate: item.vehicle?.licensePlate || item.licensePlate || item.plate || "Chưa cập nhật",
    serviceName: item.service?.name || item.serviceName || item.servicePackage?.name || "Dịch vụ WashMate",
    garageName: item.garage?.name || item.garageName || "Gara WashMate",
    garageAddress: item.garage?.address || item.garageAddress || item.address || "Đang cập nhật",
    bookingDate: item.bookingDate || item.slot?.slotDate || item.date || "",
    slotTime: item.slotTime || item.slot?.startTime || item.startTime || "",
    endTime: item.endTime || item.slot?.endTime || "",
    note: item.bookingNote || item.note || "",
    amount: Number(item.amount ?? item.service?.price ?? item.price ?? 0),
    discount: Number(item.discount ?? item.discountAmount ?? 0),
    finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? item.price ?? 0),
    isMock: Boolean(item.isMock),
  };
}

export function normalizePayment(value) {
  const root = unwrap(value) || {};
  const item = unwrap(root.payment) || root;
  return {
    ...item,
    id: item.paymentId ?? item.id ?? null,
    status: item.paymentStatus || item.status || "PENDING",
    method: item.paymentMethod || item.method || "",
    transactionCode: item.transactionCode || item.transactionId || "",
    paidAt: item.paidAt || item.paymentDate || "",
    isMock: Boolean(item.isMock),
  };
}

export function normalizeInvoice(value) {
  const root = unwrap(value) || {};
  const item = unwrap(root.invoice) || root;
  return {
    ...item,
    id: item.invoiceId ?? item.id ?? null,
    code: item.invoiceCode || item.code || "",
    status: item.invoiceStatus || item.status || "ISSUED",
    issuedAt: item.issuedAt || item.createdAt || new Date().toISOString(),
    isMock: Boolean(item.isMock),
  };
}

export function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
}

export function formatBookingDate(value) {
  if (!value) return "Đang cập nhật";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
