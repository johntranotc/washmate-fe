import { bookingApi } from "@/api/bookingApi";
import { normalizeBookingList } from "./customer-booking-data";
export async function loadCustomerBookingList() {
  try {
    const response = await bookingApi.getMyBookings();
    return {
      bookings: normalizeBookingList(response),
      usingMockData: false,
    };
  } catch (error) {
    throw error;
  }
}
