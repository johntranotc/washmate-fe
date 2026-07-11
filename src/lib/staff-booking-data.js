import { extractBookingArray } from "@/api/staffApi";

// Label trạng thái booking/payment: dùng src/lib/status-tones.js (nguồn duy nhất).

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
    customerId: customer.id ?? item.customerId ?? null,
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
    garageId: garage.id ?? item.garageId ?? null,
    garageName: garage.name ?? item.garageName ?? "Gara WashMate",

    // Status — BE dùng field "status" (không phải bookingStatus)
    bookingStatus: item.status ?? item.bookingStatus ?? "PENDING",

    // Payment — BE: { id, amount, method, status }
    paymentStatus: payment.status ?? item.paymentStatus ?? "PENDING",
    paymentId: payment.id ?? item.paymentId ?? null,
    paymentMethod: payment.method ?? item.paymentMethod ?? null,

    // Date & time — BE: bookingDate (LocalDate), slot.startTime (LocalTime)
    bookingDate: item.bookingDate ?? item.slotDate ?? "",
    slotTime: (slot.startTime ?? item.slotTime ?? item.startTime ?? "").slice(0, 5),

    finalAmount: Number(item.finalAmount ?? item.totalAmount ?? item.amount ?? 0),
    // Chỉ nhận ghi chú từ API. BE hiện CHƯA có field note trên booking → thường
    // rỗng; tuyệt đối không đọc localStorage (dữ liệu máy khác, không phải của booking).
    note: item.bookingNote ?? item.note ?? "",
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
    case "PENDING": {
      // Luồng đúng (khớp BE + UI khách): gara XÁC NHẬN TRƯỚC, khách thanh toán sau.
      // BE confirm chỉ yêu cầu status PENDING (không cần thanh toán) → luôn cho xác nhận.
      return {
        api: "confirmBooking",
        next: "CONFIRMED",
        label: "Xác nhận",
        enabled: true,
        disabledHint: null,
      };
    }
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
    case "CHECKED_IN": {
      // Chưa thanh toán hợp lệ thì không cho tiếp tục workflow (nhắc thanh toán trước).
      const paid = booking.paymentStatus === "PAID";
      return {
        api: "startWashing",
        next: "WASHING",
        label: "Bắt đầu rửa",
        enabled: paid,
        disabledHint: paid ? null : "Chờ thanh toán",
      };
    }
    case "WASHING": {
      // BE từ chối (409) hoàn tất khi payment chưa PAID.
      const paid = booking.paymentStatus === "PAID";
      return {
        api: "completeBooking",
        next: "COMPLETED",
        label: "Hoàn tất",
        enabled: paid,
        disabledHint: paid ? null : "Chờ khách thanh toán",
      };
    }
    default:
      return null;
  }
}

// Grace period giữ chỗ (phút) — đồng bộ washmate.payment.vnpay.timeout-minutes của BE
// (BE chưa có policy API nên FE giữ hằng số này; đổi ở một chỗ duy nhất tại đây).
export const NO_SHOW_GRACE_MINUTES = 15;

/** Số phút từ bây giờ tới giờ hẹn (âm nếu đã quá giờ); null nếu thiếu dữ liệu. */
export function minutesUntilSlot(booking, now = new Date()) {
  if (!booking?.bookingDate || !booking?.slotTime) return null;
  const dt = new Date(`${booking.bookingDate}T${booking.slotTime}:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return Math.round((dt.getTime() - now.getTime()) / 60000);
}

/** Booking đã quá giờ hẹn mà vẫn chưa được xử lý (PENDING/CONFIRMED). */
export function isOverdue(booking, now = new Date()) {
  if (!["PENDING", "CONFIRMED"].includes(booking?.bookingStatus)) return false;
  const m = minutesUntilSlot(booking, now);
  return m !== null && m < 0;
}

/** Đủ điều kiện chuyển No-show: BE chỉ cho CONFIRMED, và đã quá grace period. */
export function canMarkNoShow(booking, now = new Date()) {
  if (booking?.bookingStatus !== "CONFIRMED") return false;
  const m = minutesUntilSlot(booking, now);
  return m !== null && m <= -NO_SHOW_GRACE_MINUTES;
}

/**
 * Thanh toán không còn hợp lệ (bị hủy/thất bại) trên booking chưa check-in.
 * BE không cho xác nhận hay tạo lại link cho payment ngoài PENDING → case này
 * cần staff xử lý (gọi khách), không được phép check-in.
 */
export function isPaymentInvalid(booking) {
  return (
    ["PENDING", "CONFIRMED"].includes(booking?.bookingStatus) &&
    ["CANCELLED", "FAILED"].includes(booking?.paymentStatus)
  );
}

/** Booking cần staff xử lý ngay: quá giờ hẹn hoặc thanh toán không hợp lệ. */
export function isUrgent(booking, now = new Date()) {
  return isOverdue(booking, now) || isPaymentInvalid(booking);
}

/**
 * Trạng thái VẬN HÀNH để hiển thị badge: booking CONFIRMED nhưng payment đã
 * hủy/thất bại thì hiển thị "Chờ thanh toán" thay vì "Đã xác nhận" (dữ liệu
 * payment là thật từ API — chỉ đổi cách trình bày, không đổi status gốc).
 */
export function displayBookingStatus(booking) {
  if (isPaymentInvalid(booking)) return "PAYMENT_PENDING";
  return booking?.bookingStatus;
}

/**
 * Nhãn cột "Điều kiện thao tác" — luôn nhất quán với getNextStaffAction
 * (cùng suy ra từ status + payment thật, không bao giờ mâu thuẫn với badge).
 */
export function actionConditionOf(booking) {
  const paid = booking?.paymentStatus === "PAID";
  switch (booking?.bookingStatus) {
    case "PENDING":
      return paid ? "Đủ điều kiện" : "Chờ thanh toán";
    case "CONFIRMED":
      return paid ? "Đủ điều kiện check-in" : "Chờ thanh toán";
    case "CHECKED_IN":
      return "Đủ điều kiện";
    case "WASHING":
      return paid ? "Có thể hoàn tất" : "Đang thực hiện";
    default:
      return "—";
  }
}

/**
 * Nhãn NGẮN cho cột "Cần xử lý" (tối đa 2 dòng) — suy từ thời gian/payment thật.
 * Trả [] nếu không có gì cần xử lý.
 */
export function urgentShortLabels(booking, now = new Date()) {
  const labels = [];
  const m = minutesUntilSlot(booking, now);
  const overdue = isOverdue(booking, now);
  if (overdue && typeof m === "number") labels.push(`Quá ${Math.abs(m)} phút`);
  if (isPaymentInvalid(booking) || (overdue && booking.paymentStatus !== "PAID")) {
    labels.push("Cần thanh toán");
  } else if (overdue && booking.bookingStatus === "CONFIRMED") {
    const untilNoShow = NO_SHOW_GRACE_MINUTES - Math.abs(m);
    if (untilNoShow > 0) labels.push("Sắp No-show");
  }
  return labels.slice(0, 2);
}

