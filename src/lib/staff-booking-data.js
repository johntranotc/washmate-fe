export const bookingStatusLabels = {
  PENDING_STAFF_CONFIRMATION: "Chờ gara xác nhận",
  PENDING: "Chờ thanh toán",
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

export const normalizeBookingList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.content || payload?.items || payload?.data || payload?.result || [];
};

export const normalizeStaffBooking = (item) => ({
  ...item,
  id: item.bookingId ?? item.id,
  code: item.bookingCode ?? item.code,
  customerName: item.customerName ?? item.customer?.fullName ?? "Khách hàng",
  phone: item.phone ?? item.customer?.phone ?? "Chưa cập nhật",
  vehicle: item.vehicleName ?? item.vehicle?.name ?? item.vehicle ?? "Chưa cập nhật",
  plate: item.licensePlate ?? item.vehicle?.licensePlate ?? item.plate ?? "Chưa cập nhật",
  serviceName: item.serviceName ?? item.service?.name ?? "Dịch vụ chăm sóc xe",
  garageName: item.garageName ?? item.garage?.name ?? "Gara WashMate",
  bookingStatus: item.bookingStatus ?? item.status ?? "PENDING_STAFF_CONFIRMATION",
  paymentStatus: item.paymentStatus ?? item.payment?.status ?? "PENDING",
  bookingDate: item.bookingDate ?? item.slotDate,
  slotTime: item.slotTime ?? item.startTime ?? item.slot?.startTime,
  finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? 0),
  note: item.bookingNote ?? item.note ?? "",
});

// Badge color for each status
export const bookingStatusTone = {
  PENDING_STAFF_CONFIRMATION: "bg-orange-100 text-orange-700",
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-cyan-100 text-cyan-700",
  WASHING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
};
