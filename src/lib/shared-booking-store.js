// Shared source of truth for demo bookings.
// Both customer and staff pages read/write the same localStorage key.

const BOOKINGS_KEY = "washmate_demo_bookings";
const NOTIF_KEY = "washmate_demo_notifications";

export function getSharedBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSharedBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch {
    // ignore quota errors in tests
  }
}

export function pushDemoNotification(notif) {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
    localStorage.setItem(NOTIF_KEY, JSON.stringify([notif, ...list].slice(0, 50)));
  } catch {
    // ignore
  }
}

export function getDemoNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
}

// Called by staff when confirming a booking.
// Updates shared localStorage + creates customer notification.
export function confirmBookingByStaff(bookingId) {
  const bookings = getSharedBookings();
  const booking = bookings.find((b) => String(b.id) === String(bookingId));
  if (!booking) return;

  saveSharedBookings(
    bookings.map((b) =>
      String(b.id) === String(bookingId)
        ? { ...b, bookingStatus: "CONFIRMED" }
        : b,
    ),
  );

  pushDemoNotification({
    id: `notif-confirm-${bookingId}-${Date.now()}`,
    type: "BOOKING",
    title: "Lịch đặt đã được gara xác nhận",
    message: `Lịch rửa xe của bạn tại ${booking.garageName || "gara WashMate"}${booking.bookingDate ? ` vào ${booking.bookingDate}` : ""}${booking.slotTime ? ` lúc ${booking.slotTime}` : ""} đã được xác nhận. Bạn có thể tiếp tục thanh toán hoặc đến đúng giờ theo lịch.`,
    read: false,
    createdAt: new Date().toISOString(),
    link: `/khach-hang/lich-dat/${booking.id}`,
  });
}

// Called by staff when rejecting a booking.
// Updates shared localStorage + creates customer notification.
export function rejectBookingByStaff(bookingId, reason = "") {
  const bookings = getSharedBookings();
  const booking = bookings.find((b) => String(b.id) === String(bookingId));
  if (!booking) return;

  saveSharedBookings(
    bookings.map((b) =>
      String(b.id) === String(bookingId)
        ? { ...b, bookingStatus: "REJECTED" }
        : b,
    ),
  );

  const baseMsg = reason
    ? `Gara ${booking.garageName || "WashMate"} từ chối lịch đặt của bạn. Lý do: ${reason}.`
    : `Gara ${booking.garageName || "WashMate"} không thể xác nhận lịch đặt này. Vui lòng đặt lịch mới hoặc liên hệ trực tiếp với gara.`;

  pushDemoNotification({
    id: `notif-reject-${bookingId}-${Date.now()}`,
    type: "BOOKING",
    title: "Lịch đặt chưa được xác nhận",
    message: baseMsg,
    read: false,
    createdAt: new Date().toISOString(),
    link: `/khach-hang/lich-dat/${booking.id}`,
  });
}

// Update a booking's status in shared store (for workflow updates after CONFIRMED)
export function updateSharedBookingStatus(bookingId, nextStatus, extra = {}) {
  const bookings = getSharedBookings();
  const updated = bookings.map((b) =>
    String(b.id) === String(bookingId)
      ? { ...b, bookingStatus: nextStatus, ...extra }
      : b,
  );
  saveSharedBookings(updated);
}
