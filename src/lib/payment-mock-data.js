import { normalizePayment } from "./customer-booking-data";

export function createDemoPayment(booking, overrides = {}) {
  return normalizePayment({
    id: booking.payment?.id || booking.id,
    status: booking.paymentStatus || "PENDING",
    method: booking.paymentMethod || "",
    transactionCode: booking.transactionCode || "",
    paidAt: booking.paidAt || "",
    isMock: true,
    ...overrides,
  });
}

export function createPaidDemoPayment(booking, method) {
  return createDemoPayment(booking, {
    status: "PAID",
    method,
    transactionCode: `DEMO-TXN-${Date.now()}`,
    paidAt: new Date().toISOString(),
  });
}
