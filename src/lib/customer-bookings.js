import { bookingApi } from "@/api/bookingApi";
import { normalizeBookingList } from "./customer-booking-data";

/** Tải danh sách lịch đặt của khách từ API thật (GET /bookings/me) và chuẩn hóa. */
export async function loadCustomerBookingList() {
  const response = await bookingApi.getMyBookings();
  return { bookings: normalizeBookingList(response) };
}
