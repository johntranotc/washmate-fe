import { extractBookingArray } from "@/api/staffApi";

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
  const arr = extractBookingArray(payload);
  if (arr.length === 0 && payload !== undefined && payload !== null) {
    // Debug: log when we get unexpected shape so devs can inspect in console
    console.debug("[normalizeBookingList] could not extract array from payload:", payload);
  }
  return arr;
};


export const normalizeStaffBooking = (value = {}) => {
  // BE trả về: { id, bookingCode, status, bookingDate, customer:{fullName,phone}, garage:{name},
  //              slot:{startTime,endTime}, service:{name}, vehicle:{licensePlate,brand,model},
  //              payment:{id,status,method} }
  const item = value?.booking || value;

  const customer = item.customer || {};
  const garage   = item.garage   || {};
  const slot     = item.slot     || {};
  const service  = item.service  || {};
  const vehicle  = item.vehicle  || {};
  const payment  = item.payment  || {};

  return {
    ...item,
    id: item.id ?? item.bookingId,
    code: item.bookingCode ?? item.code,

    // Customer
    customerName: customer.fullName ?? item.customerName ?? "Khách hàng",
    phone: customer.phone ?? item.phone ?? "Chưa cập nhật",

    // Vehicle — BE: { licensePlate, brand, model }
    vehicle: formatSafeString(
      item.vehicleName || (vehicle.brand || vehicle.model ? `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() : null),
      "Xe của khách hàng"
    ),
    plate: vehicle.licensePlate ?? item.licensePlate ?? item.plate ?? "Chưa cập nhật",

    // Service — BE: { name, price, duration }
    serviceName: service.name ?? item.serviceName ?? "Dịch vụ chăm sóc xe",

    // Garage — BE: { id, name }
    garageName: garage.name ?? item.garageName ?? "Gara WashMate",

    // Status — BE dùng field "status" (không phải bookingStatus)
    bookingStatus: item.status ?? item.bookingStatus ?? "PENDING",

    // Payment — BE: { id, amount, method, status }
    paymentStatus: payment.status ?? item.paymentStatus ?? "PENDING",

    // Date & time — BE: bookingDate (LocalDate), slot.startTime (LocalTime)
    bookingDate: item.bookingDate ?? item.slotDate ?? "",
    slotTime: (slot.startTime ?? item.slotTime ?? item.startTime ?? "").slice(0, 5),

    finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? 0),
    note: (() => {
      let n = item.bookingNote ?? item.note ?? "";
      if (!n) {
        try {
          const notesMap = JSON.parse(localStorage.getItem("washmate_booking_notes") || "{}");
          n = notesMap[item.id] || notesMap[item.bookingCode] || localStorage.getItem("washmate_latest_booking_note") || "";
        } catch {}
      }
      return n;
    })(),
  };
};

/**
 * Xác định thao tác hợp lệ tiếp theo cho staff dựa trên vòng đời booking.
 * Trả về null nếu không còn thao tác (COMPLETED/CANCELLED/REJECTED/NO_SHOW).
 *
 * Workflow:
 *   PENDING     -> Xác nhận       (confirmBooking)   [chỉ khi BE hỗ trợ /confirm]
 *   CONFIRMED   -> Check-in       (checkInBooking)   [yêu cầu payment PAID]
 *   CHECKED_IN  -> Bắt đầu rửa    (startWashing)
 *   WASHING     -> Hoàn tất       (completeBooking)
 */
export function getNextStaffAction(booking) {
  if (!booking) return null;
  switch (booking.bookingStatus) {
    case "PENDING":
      return { api: "confirmBooking", next: "CONFIRMED", label: "Xác nhận", enabled: true };
    case "CONFIRMED": {
      const paid = booking.paymentStatus === "PAID";
      return {
        api: "checkInBooking",
        next: "CHECKED_IN",
        label: "Check-in",
        enabled: paid,
        disabledHint: paid ? null : "Chờ khách thanh toán",
      };
    }
    case "CHECKED_IN":
      return { api: "startWashing", next: "WASHING", label: "Bắt đầu rửa", enabled: true };
    case "WASHING":
      return { api: "completeBooking", next: "COMPLETED", label: "Hoàn tất", enabled: true };
    default:
      return null;
  }
}

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
