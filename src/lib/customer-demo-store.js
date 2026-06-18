import { normalizeBooking } from "./customer-booking-data";

const KEY = "washmate_demo_bookings";
const NOTIF_KEY = "washmate_demo_notifications";

export function getCustomerDemoBookings() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomerDemoBookings(bookings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bookings));
  } catch {
    return bookings;
  }
  return bookings;
}

export function addCustomerDemoBooking(rawBooking) {
  const bookings = getCustomerDemoBookings();
  const normalized = normalizeBooking({ ...rawBooking, isMock: true });
  const result = saveCustomerDemoBookings([normalized, ...bookings]);
  _pushNotification({
    id: Date.now(),
    type: "NEW_BOOKING",
    bookingId: normalized.id,
    bookingCode: normalized.code,
    garageName: normalized.garageName,
    message: `Đặt lịch ${normalized.code} tại ${normalized.garageName} đang chờ xác nhận`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return result;
}

export function findCustomerDemoBooking(bookingId) {
  return (
    getCustomerDemoBookings().find(
      (booking) => String(booking.id) === String(bookingId),
    ) || null
  );
}

export function updateCustomerDemoBookingPayment(bookingId, payment, fallbackBooking) {
  const bookings = getCustomerDemoBookings();
  const exists = bookings.some((booking) => String(booking.id) === String(bookingId));
  const next = exists
    ? bookings.map((booking) =>
        String(booking.id) === String(bookingId)
          ? normalizeBooking({ ...booking, payment, paymentStatus: payment.status, isMock: true })
          : booking,
      )
    : fallbackBooking
      ? [normalizeBooking({ ...fallbackBooking, payment, paymentStatus: payment.status, isMock: true }), ...bookings]
      : bookings;
  return saveCustomerDemoBookings(next);
}

function _pushNotification(notif) {
  try {
    const saved = localStorage.getItem(NOTIF_KEY);
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem(NOTIF_KEY, JSON.stringify([notif, ...list].slice(0, 50)));
  } catch {
    // silently ignore
  }
}

export function getDemoNotifications() {
  try {
    const saved = localStorage.getItem(NOTIF_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
