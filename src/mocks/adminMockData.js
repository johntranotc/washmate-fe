export const adminMockData = {
  summary: { garages: 3, activeServices: 8, todayBookings: 24, revenue: 42850000, paidPayments: 21, completedBookings: 18 },
  garages: [
    { id: 1, name: "WashMate Quận 1", address: "120 Nguyễn Huệ, Quận 1, TP.HCM", phone: "028 7300 1001", status: "ACTIVE", slotsPerDay: 32 },
    { id: 2, name: "WashMate Thủ Đức", address: "88 Võ Văn Ngân, TP. Thủ Đức", phone: "028 7300 1002", status: "ACTIVE", slotsPerDay: 28 },
    { id: 3, name: "WashMate Hải Châu", address: "45 Bạch Đằng, Hải Châu, Đà Nẵng", phone: "0236 730 1003", status: "MAINTENANCE", slotsPerDay: 20 },
  ],
  services: [
    { id: 1, name: "Rửa xe cơ bản", price: 100000, duration: 30, garage: "Tất cả gara", status: "ACTIVE" },
    { id: 2, name: "Rửa xe cao cấp", price: 180000, duration: 45, garage: "Tất cả gara", status: "ACTIVE" },
    { id: 3, name: "Chăm sóc toàn diện", price: 350000, duration: 90, garage: "Quận 1, Thủ Đức", status: "ACTIVE" },
    { id: 4, name: "Vệ sinh nội thất", price: 250000, duration: 60, garage: "Quận 1", status: "PAUSED" },
  ],
  slots: [
    { id: 1, garage: "WashMate Quận 1", date: "2026-06-15", startTime: "08:00", endTime: "08:30", capacity: 4, booked: 3 },
    { id: 2, garage: "WashMate Quận 1", date: "2026-06-15", startTime: "08:30", endTime: "09:00", capacity: 4, booked: 4 },
    { id: 3, garage: "WashMate Thủ Đức", date: "2026-06-15", startTime: "09:00", endTime: "09:30", capacity: 3, booked: 1 },
  ],
  bookings: [
    { id: 701, code: "BK-0701", customer: "Nguyễn Minh Anh", garage: "WashMate Quận 1", service: "Rửa xe cao cấp", dateTime: "15/06/2026 · 08:00", bookingStatus: "CONFIRMED", paymentStatus: "PAID" },
    { id: 702, code: "BK-0702", customer: "Trần Quốc Huy", garage: "WashMate Quận 1", service: "Chăm sóc toàn diện", dateTime: "15/06/2026 · 09:30", bookingStatus: "CHECKED_IN", paymentStatus: "PAID" },
    { id: 703, code: "BK-0703", customer: "Lê Hoàng Nam", garage: "WashMate Thủ Đức", service: "Rửa xe cơ bản", dateTime: "15/06/2026 · 10:00", bookingStatus: "WASHING", paymentStatus: "PAID" },
  ],
  payments: [
    { id: "PAY-260615-01", bookingCode: "BK-0701", customer: "Nguyễn Minh Anh", amount: 180000, method: "Thẻ ngân hàng", status: "PAID", paidAt: "15/06/2026 07:45" },
    { id: "PAY-260615-02", bookingCode: "BK-0702", customer: "Trần Quốc Huy", amount: 350000, method: "Chuyển khoản", status: "PAID", paidAt: "15/06/2026 09:10" },
  ],
  invoices: [
    { id: "INV-260615-01", bookingCode: "BK-0701", customer: "Nguyễn Minh Anh", total: 180000, status: "ISSUED", issuedAt: "15/06/2026 07:46" },
    { id: "INV-260615-02", bookingCode: "BK-0702", customer: "Trần Quốc Huy", total: 350000, status: "ISSUED", issuedAt: "15/06/2026 09:11" },
  ],
};
