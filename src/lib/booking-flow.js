export const bookingSteps = [
  "Chọn gara",
  "Dịch vụ",
  "Xe của bạn",
  "Khung giờ",
  "Xác nhận",
  "Hoàn tất",
];

export function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  if (value?.data && typeof value.data === "object") return asList(value.data);
  if (value?.result && typeof value.result === "object") return asList(value.result);
  return [];
}

export function getId(item, keys = []) {
  return keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null) ?? item?.id;
}

export function getGarageId(garage) {
  return garage?.garageId ?? garage?.id ?? garage?.garage_id ?? null;
}

export function normalizeVehicle(item) {
  return {
    ...item,
    id: getId(item, ["vehicleId"]),
    licensePlate: item.licensePlate || item.plate || "Chưa cập nhật",
    brand: item.brand || item.make || "",
    model: item.model || item.name || "",
    color: item.color || "Chưa cập nhật",
    type: item.type || item.vehicleType || "",
    status: item.status || "ACTIVE",
  };
}

export function normalizeService(item) {
  let rawName = item.name || item.serviceName || "Gói chăm sóc xe";
  let rawDesc = item.description || "Dịch vụ chăm sóc xe chuyên nghiệp tại WashMate.";

  if (rawName.includes("Basic Wash") || rawName.includes("Basic")) {
    rawName = "Rửa Xe Bọt Tuyết Tiêu Chuẩn";
    rawDesc = "Rửa vỏ bọt tuyết, hút bụi nội thất cơ bản, xịt gầm.";
  } else if (rawName.includes("Premium Detail") || rawName.includes("Premium")) {
    rawName = "Chăm Sóc Chi Tiết & Phủ Bóng VIP";
    rawDesc = "Vệ sinh khoang máy, hút bụi chuyên sâu, phủ bóng sơn nhanh.";
  }

  return {
    ...item,
    id: getId(item, ["serviceId", "servicePackageId"]),
    name: rawName,
    description: rawDesc,
    price: Number(item.price ?? item.basePrice ?? item.amount ?? 0),
    duration: Number(item.duration ?? item.durationMinutes ?? item.estimatedDuration ?? 0),
    status: item.status || "ACTIVE",
    garageId: item.garageId ?? item.garage?.id ?? null,
    badge: item.badge || item.tag || "",
    isMock: Boolean(item.isMock),
  };
}

export function normalizeGarage(item) {
  return {
    ...item,
    id: getGarageId(item),
    name: item.name || item.garageName || "Gara WashMate",
    address: item.address || item.fullAddress || "Địa chỉ đang cập nhật",
    phone: item.phone || item.phoneNumber || "Đang cập nhật",
    openingHours: item.openingHours || item.workingHours || "07:00 - 20:00",
    status: item.status || "ACTIVE",
    rating: Number(item.rating ?? 4.5),
    reviewCount: Number(item.reviewCount ?? 0),
    availableSlots: Number(item.availableSlots ?? 12),
    distanceKm: item.distanceKm ?? null,
    isOpen: item.isOpen !== false,
    district: item.district || "",
    badges: Array.isArray(item.badges) ? item.badges : [],
    lat: item.lat ?? null,
    lng: item.lng ?? null,
    isMock: Boolean(item.isMock),
  };
}

export function normalizeSlot(item) {
  const maxCapacity = Number(item.maxCapacity ?? item.capacity ?? 10);
  const bookedCount = Number(item.bookedCount ?? item.currentBookings ?? 0);
  const isFull = bookedCount >= maxCapacity || ["FULL", "CLOSED"].includes(item.status);
  const status = isFull ? "FULL" : "OPEN";
  const disabled = isFull;
  const almostFull = !disabled && maxCapacity > 0 && bookedCount >= Math.ceil(maxCapacity * 0.5);
  return {
    ...item,
    id: getId(item, ["slotId", "bookingSlotId"]),
    garageId: item.garageId ?? item.garage?.id ?? null,
    startTime: item.startTime || item.time || "",
    endTime: item.endTime || item.finishTime || "",
    maxCapacity,
    bookedCount,
    status,
    isMock: Boolean(item.isMock),
    disabled,
    almostFull,
  };
}

export function normalizeBookingResponse(response) {
  const root = response?.data || response || {};
  const booking = root.booking?.data || root.booking || root;
  const payment = root.payment?.data || root.payment || {};
  return {
    bookingId: booking.id ?? booking.bookingId ?? root.bookingId,
    bookingCode: booking.code ?? booking.bookingCode ?? root.bookingCode,
    paymentId: payment.id ?? payment.paymentId ?? root.paymentId,
    bookingStatus: booking.status ?? booking.bookingStatus ?? root.bookingStatus ?? "PENDING",
    paymentStatus: payment.status ?? payment.paymentStatus ?? root.paymentStatus ?? "PENDING",
    raw: response,
  };
}

export function bookingErrorMessage(error) {
  const msg = error?.message || "";
  if (msg.includes("Service package does not belong")) return "Gói dịch vụ bạn chọn không thuộc về gara này. Vui lòng chọn lại dịch vụ ở Bước 2.";
  if (msg.includes("Slot does not belong")) return "Khung giờ bạn chọn không thuộc về gara này.";
  if (msg.includes("full") || ["SLOT_FULL", "BOOKING_SLOT_FULL"].includes(error?.errorCode)) return "Khung giờ này vừa có khách đặt đầy.";
  if (msg.includes("not active")) return "Gara hoặc gói dịch vụ hiện đang tạm ngưng nhận lịch.";
  if (error?.status === 400 || error?.errorCode === "VALIDATION_ERROR") {
    if (msg && msg !== "Validation failed" && !msg.includes("Invalid request")) return msg;
    return "Thông tin đặt lịch chưa chính xác hoặc khung giờ/dịch vụ không hợp lệ.";
  }
  return msg || "Không thể gửi yêu cầu đặt lịch lúc này. Vui lòng thử lại.";
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function normalizeBookingDate(value) {
  if (!value) return "";
  const dateValue = String(value).trim();
  const directMatch = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directMatch) return directMatch[1];

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");
}

export function nextDates(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    const value = `${year}-${month}-${dayStr}`;
    return {
      value,
      day: new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date),
      weekday: index === 0 ? "Hôm nay" : new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
    };
  });
}
