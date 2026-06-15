import { normalizeBooking } from "./customer-booking-data";

const KEY = "washmate_customer_demo_bookings";

export function getCustomerDemoBookings() {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomerDemoBookings(bookings) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(bookings));
  } catch {
    return bookings;
  }
  return bookings;
}

export function addCustomerDemoBooking(rawBooking) {
  const bookings = getCustomerDemoBookings();
  const normalized = normalizeBooking({ ...rawBooking, isMock: true });
  return saveCustomerDemoBookings([normalized, ...bookings]);
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
