export const UNKNOWN_STATUS_LABEL = "Không xác định";

export const bookingStatusLabels = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa xe",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};

export const paymentStatusLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export const operationStatusLabels = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  MAINTENANCE: "Bảo trì",
  AVAILABLE: "Còn chỗ",
  OPEN: "Còn chỗ",
  FULL: "Đã đầy",
  CLOSED: "Đã đóng",
  PAUSED: "Tạm ngừng",
  DELETED: "Đã xóa",
};

export const invoiceStatusLabels = {
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const labelFrom = (labels, status) =>
  labels[String(status || "").toUpperCase()] || UNKNOWN_STATUS_LABEL;

export const getBookingStatusLabel = (status) =>
  labelFrom(bookingStatusLabels, status);

export const getPaymentStatusLabel = (status) =>
  labelFrom(paymentStatusLabels, status);

export const getOperationStatusLabel = (status) =>
  labelFrom(operationStatusLabels, status);

export const getInvoiceStatusLabel = (status) =>
  labelFrom(invoiceStatusLabels, status);

export const getStatusLabel = (status, type) => {
  if (type === "booking") return getBookingStatusLabel(status);
  if (type === "payment") return getPaymentStatusLabel(status);
  if (type === "invoice") return getInvoiceStatusLabel(status);
  return getOperationStatusLabel(status);
};
