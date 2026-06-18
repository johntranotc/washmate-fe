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
    // Dedup: skip if a notification with the same id already exists
    if (notif.id && list.some((n) => String(n.id) === String(notif.id))) return;
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
  // Deduplicate: skip if already confirmed
  if (booking.bookingStatus === "CONFIRMED") return;

  saveSharedBookings(
    bookings.map((b) =>
      String(b.id) === String(bookingId)
        ? { ...b, bookingStatus: "CONFIRMED" }
        : b,
    ),
  );

  pushDemoNotification({
    id: `notif-confirm-${bookingId}`,
    type: "BOOKING",
    title: "Lịch đặt đã được gara xác nhận",
    message: `Gara đã xác nhận lịch đặt của bạn. Vui lòng hoàn tất thanh toán để giữ khung giờ.`,
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
  // Deduplicate: skip if already rejected
  if (booking.bookingStatus === "REJECTED") return;

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
    id: `notif-reject-${bookingId}`,
    type: "BOOKING",
    title: "Lịch đặt chưa được xác nhận",
    message: baseMsg,
    read: false,
    createdAt: new Date().toISOString(),
    link: `/khach-hang/lich-dat/${booking.id}`,
  });
}

export function markDemoNotificationRead(id) {
  try {
    const list = getDemoNotifications();
    localStorage.setItem(NOTIF_KEY, JSON.stringify(
      list.map((n) => String(n.id) === String(id) ? { ...n, read: true } : n),
    ));
  } catch {
    // ignore
  }
}

export function markAllDemoNotificationsRead() {
  try {
    const list = getDemoNotifications();
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.map((n) => ({ ...n, read: true }))));
  } catch {
    // ignore
  }
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

// Called by customer when cancelling a booking.
export function cancelBookingByCustomer(bookingId) {
  const bookings = getSharedBookings();
  const booking = bookings.find((b) => String(b.id) === String(bookingId));
  if (!booking) return;
  if (booking.bookingStatus === "CANCELLED") return;

  saveSharedBookings(
    bookings.map((b) =>
      String(b.id) === String(bookingId)
        ? { ...b, bookingStatus: "CANCELLED" }
        : b,
    ),
  );

  pushDemoNotification({
    id: `notif-cancel-${bookingId}-${Date.now()}`,
    type: "BOOKING",
    title: "Bạn đã hủy lịch đặt",
    message: `Lịch đặt ${booking.code} của bạn tại ${booking.garageName || "gara WashMate"} đã được hủy thành công.`,
    read: false,
    createdAt: new Date().toISOString(),
    link: `/khach-hang/lich-dat/${booking.id}`,
  });
}
