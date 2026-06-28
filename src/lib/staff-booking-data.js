export const bookingStatusLabels = {
  PENDING: "Chờ gara xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Gara từ chối",
  NO_SHOW: "Không đến",
};

export const paymentStatusLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

function formatSafeString(val, fallback) {
  if (typeof val === "string" && val.trim() !== "") return val;
  if (val && typeof val === "object") {
    const str = val.name || `${val.brand || ""} ${val.model || ""}`.trim() || val.title || val.packageName || val.serviceName || val.garageName || val.licensePlate;
    if (str && typeof str === "string") return str;
  }
  return fallback;
}


export const normalizeBookingList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.content || payload?.items || payload?.data || payload?.result || [];
};

export const normalizeStaffBooking = (value = {}) => {
  const item = value?.booking || value;

  return {
    ...item,
    id: item.bookingId ?? item.id,
    code: item.bookingCode ?? item.code,
    customerName: item.customerName ?? item.customer?.fullName ?? "Khách hàng",
    phone: item.phone ?? item.customer?.phone ?? "Chưa cập nhật",
    vehicle: formatSafeString(item.vehicleName || item.vehicle, "Xe của khách hàng"),
    plate: formatSafeString(item.licensePlate || item.plate || item.vehicle?.licensePlate, "Chưa cập nhật"),
    serviceName: formatSafeString(item.serviceName || item.service, "Dịch vụ chăm sóc xe"),
    garageName: formatSafeString(item.garageName || item.garage, "Gara WashMate"),
    bookingStatus: item.bookingStatus ?? item.status ?? "PENDING",
    paymentStatus: item.paymentStatus ?? item.payment?.status ?? "PENDING",
    bookingDate: item.bookingDate ?? item.slotDate,
    slotTime: item.slotTime ?? item.startTime ?? item.slot?.startTime,
    finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? 0),
    note: item.bookingNote ?? item.note ?? "",
  };
};

// Badge color for each status
export const bookingStatusTone = {
  PENDING: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-cyan-100 text-cyan-700",
  WASHING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
};
