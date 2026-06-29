import { asList } from "./booking-flow";

export const bookingStatusLabels = {
  PENDING: "Chờ gara xác nhận",
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

function formatSafeString(val, fallback) {
  if (typeof val === "string" && val.trim() !== "") return val;
  if (val && typeof val === "object") {
    const str = val.name || `${val.brand || ""} ${val.model || ""}`.trim() || val.title || val.packageName || val.serviceName || val.garageName || val.licensePlate;
    if (str && typeof str === "string") return str;
  }
  return fallback;
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
  const backendStatus = item.bookingStatus || item.status || "PENDING";
  const bookingStatus =
    backendStatus === "PENDING" && payment.status === "PAID"
      ? "CONFIRMED"
      : backendStatus;

  let savedNote = item.bookingNote || item.note || "";
  if (!savedNote) {
    try {
      const notesMap = JSON.parse(localStorage.getItem("washmate_booking_notes") || "{}");
      const bid = item.bookingId ?? item.id;
      const bcode = item.bookingCode || item.code;
      savedNote = notesMap[bid] || notesMap[bcode] || localStorage.getItem("washmate_latest_booking_note") || "";
    } catch {}
  }

  return {
    ...item,
    id: item.bookingId ?? item.id,
    code: item.bookingCode || item.code || `BK-${item.bookingId ?? item.id ?? "..."}`,
    bookingStatus,
    paymentStatus: payment.status,
    payment,
    vehicle: formatSafeString(item.vehicle || item.vehicleName, "Xe của khách hàng"),
    plate: formatSafeString(item.vehicle?.licensePlate || item.licensePlate || item.plate, "Chưa cập nhật"),
    serviceName: formatSafeString(item.service || item.serviceName || item.servicePackage, "Dịch vụ WashMate"),
    garageName: formatSafeString(item.garage || item.garageName, "Gara WashMate"),
    garageAddress: formatSafeString(item.garage?.address || item.garageAddress || item.address, "Đang cập nhật"),
    bookingDate: item.bookingDate || item.slot?.slotDate || item.date || "",
    slotTime: (item.slotTime || item.slot?.startTime || item.startTime || "").slice(0, 5),
    endTime: (item.endTime || item.slot?.endTime || "").slice(0, 5),
    note: savedNote,
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
