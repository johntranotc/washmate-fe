import { bookingApi } from "@/api/bookingApi";
import { normalizeBookingList } from "./customer-booking-data";
import { createMockBookings } from "./booking-mock-data";
import { getCustomerDemoBookings } from "./customer-demo-store";

export async function loadCustomerBookingList() {
  const demoBookings = getCustomerDemoBookings();
  try {
    const response = await bookingApi.getMyBookings();
    const list = normalizeBookingList(response);
    if (!list.length) {
      return {
        bookings: [...demoBookings, ...createMockBookings()],
        usingMockData: true,
      };
    }
    return {
      bookings: [...demoBookings, ...list],
      usingMockData: demoBookings.length > 0,
    };
  } catch {
    return {
      bookings: [...demoBookings, ...createMockBookings()],
      usingMockData: true,
    };
  }
}
