import { staffMockBookings } from "../mocks/staffMockData";
import {
  confirmBookingByStaff,
  getSharedBookings,
  rejectBookingByStaff,
  updateSharedBookingStatus,
} from "./shared-booking-store";

const STAFF_KEY = "washmate_staff_demo_bookings";

// Convert customer booking format → staff UI format
function toStaffFormat(b) {
  return {
    id: b.id,
    code: b.code || b.bookingCode || `BK-${b.id}`,
    customerName: b.customerName || "Khách hàng",
    phone: b.customerPhone || b.phone || "Chưa cập nhật",
    vehicle: b.vehicle || b.vehicleName || "Xe khách hàng",
    plate: b.plate || b.licensePlate || "Chưa cập nhật",
    serviceName: b.serviceName || "Dịch vụ WashMate",
    garageName: b.garageName || "Gara WashMate",
    bookingDate: b.bookingDate || b.date || "",
    slotTime: b.slotTime || b.time || "",
    bookingStatus: b.bookingStatus || "PENDING_STAFF_CONFIRMATION",
    paymentStatus: b.paymentStatus || "PENDING",
    finalAmount: Number(b.finalAmount || b.amount || 0),
    note: b.note || "",
    _fromCustomer: true,
  };
}

function getStaffOnlyBookings() {
  try {
    const saved = sessionStorage.getItem(STAFF_KEY);
    return saved ? JSON.parse(saved) : [...staffMockBookings];
  } catch {
    return [...staffMockBookings];
  }
}

function saveStaffOnlyBookings(bookings) {
  try {
    sessionStorage.setItem(STAFF_KEY, JSON.stringify(bookings));
  } catch {
    // ignore
  }
}

// Returns merged list: customer bookings (from localStorage) + staff mock bookings (sessionStorage)
export const getStaffDemoBookings = () => {
  const customerBookings = getSharedBookings().map(toStaffFormat);
  const customerIds = new Set(customerBookings.map((b) => String(b.id)));

  const staffOnly = getStaffOnlyBookings().filter(
    (b) => !customerIds.has(String(b.id)),
  );

  // Customer bookings first (most recent on top), then staff mock data
  return [...customerBookings, ...staffOnly];
};

export const saveStaffDemoBookings = (bookings) => {
  // Only persist the non-customer portion to sessionStorage
  const staffOnly = bookings.filter((b) => !b._fromCustomer);
  saveStaffOnlyBookings(staffOnly);
  return bookings;
};

// Confirm a PENDING_STAFF_CONFIRMATION booking → CONFIRMED
export const confirmStaffBooking = (bookingId) => {
  // Update shared localStorage + push customer notification
  confirmBookingByStaff(bookingId);

  // Also update sessionStorage (in case it's a staff-only booking)
  const staffOnly = getStaffOnlyBookings();
  const updated = staffOnly.map((b) =>
    String(b.id) === String(bookingId) ? { ...b, bookingStatus: "CONFIRMED" } : b,
  );
  saveStaffOnlyBookings(updated);

  return getStaffDemoBookings();
};

// Reject a booking → REJECTED
export const rejectStaffBooking = (bookingId, reason = "") => {
  rejectBookingByStaff(bookingId, reason);

  const staffOnly = getStaffOnlyBookings();
  const updated = staffOnly.map((b) =>
    String(b.id) === String(bookingId) ? { ...b, bookingStatus: "REJECTED" } : b,
  );
  saveStaffOnlyBookings(updated);

  return getStaffDemoBookings();
};

// Workflow updates (CONFIRMED → CHECKED_IN → WASHING → COMPLETED)
export const updateStaffDemoBooking = (bookingId, nextStatus) => {
  const allowed = {
    CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELLED"],
    CHECKED_IN: ["WASHING"],
    WASHING: ["COMPLETED"],
  };

  const all = getStaffDemoBookings();
  const booking = all.find((b) => String(b.id) === String(bookingId));
  if (!booking || !allowed[booking.bookingStatus]?.includes(nextStatus)) return all;

  const timestamp = new Date().toISOString();
  const extra = {
    ...(nextStatus === "CHECKED_IN" && { checkinTime: timestamp }),
    ...(nextStatus === "WASHING" && { serviceStartTime: timestamp }),
    ...(nextStatus === "COMPLETED" && { completedTime: timestamp }),
  };

  // If it came from customer localStorage, update there too
  if (booking._fromCustomer) {
    updateSharedBookingStatus(bookingId, nextStatus, extra);
  }

  // Update sessionStorage (for staff-only mock bookings)
  const staffOnly = getStaffOnlyBookings();
  const updatedStaff = staffOnly.map((b) =>
    String(b.id) === String(bookingId)
      ? { ...b, bookingStatus: nextStatus, ...extra }
      : b,
  );
  saveStaffOnlyBookings(updatedStaff);

  return getStaffDemoBookings();
};
