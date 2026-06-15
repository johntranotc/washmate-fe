export const bookingStatusLabels = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
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
  bookingStatus: item.bookingStatus ?? item.status ?? "PENDING",
  paymentStatus: item.paymentStatus ?? item.payment?.status ?? "PENDING",
  bookingDate: item.bookingDate ?? item.slotDate,
  slotTime: item.slotTime ?? item.startTime ?? item.slot?.startTime,
  finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? 0),
  note: item.bookingNote ?? item.note ?? "",
});
