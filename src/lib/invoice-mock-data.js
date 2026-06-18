import { normalizeInvoice } from "./customer-booking-data";

export function createDemoInvoice(booking, payment) {
  return normalizeInvoice({
    id: booking.id,
    code: booking.invoiceCode || `INV-${String(booking.id).padStart(4, "0")}`,
    bookingId: booking.id,
    status: payment.status === "PAID" ? "PAID" : "ISSUED",
    issuedAt: payment.paidAt || new Date().toISOString(),
    isMock: true,
  });
}
