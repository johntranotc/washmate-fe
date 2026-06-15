import { staffMockBookings } from "../mocks/staffMockData";

const KEY = "washmate_staff_demo_bookings";

export const getStaffDemoBookings = () => {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : staffMockBookings;
  } catch {
    return staffMockBookings;
  }
};

export const saveStaffDemoBookings = (bookings) => {
  sessionStorage.setItem(KEY, JSON.stringify(bookings));
  return bookings;
};

export const updateStaffDemoBooking = (bookingId, nextStatus) => {
  const allowed = {
    CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELLED"],
    CHECKED_IN: ["WASHING"],
    WASHING: ["COMPLETED"],
  };
  const bookings = getStaffDemoBookings();
  const next = bookings.map((booking) => {
    if (String(booking.id) !== String(bookingId) || !allowed[booking.bookingStatus]?.includes(nextStatus)) return booking;
    const timestamp = new Date().toISOString();
    return {
      ...booking,
      bookingStatus: nextStatus,
      ...(nextStatus === "CHECKED_IN" && { checkinTime: timestamp }),
      ...(nextStatus === "WASHING" && { serviceStartTime: timestamp }),
      ...(nextStatus === "COMPLETED" && { completedTime: timestamp }),
    };
  });
  return saveStaffDemoBookings(next);
};
