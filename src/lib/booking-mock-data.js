import {
  normalizeGarage,
  normalizeService,
  normalizeSlot,
  normalizeVehicle,
} from "./booking-flow";
import { normalizeBooking } from "./customer-booking-data";

const mockGarageSeed = [
  { id: 1, name: "WashMate Quận 7", address: "12 Nguyễn Văn Linh, Quận 7", phone: "028 1234 5678", openingHours: "07:00 - 20:00" },
  { id: 2, name: "WashMate Thủ Đức", address: "25 Võ Văn Ngân, Thủ Đức", phone: "028 2345 6789", openingHours: "07:00 - 20:00" },
  { id: 3, name: "WashMate Bình Thạnh", address: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh", phone: "028 3456 7890", openingHours: "07:00 - 20:00" },
];

export function createMockGarages(items = mockGarageSeed) {
  return items.map((item) =>
    normalizeGarage({
      ...item,
      isMock: true,
    }),
  );
}

export function createMockVehicles() {
  return [
    { id: "mock-vehicle-1", licensePlate: "51A-238.88", brand: "Toyota", model: "Vios", color: "Trắng ngọc trai", status: "ACTIVE" },
    { id: "mock-vehicle-2", licensePlate: "30H-889.12", brand: "Mazda", model: "CX-5", color: "Xanh đậm", status: "ACTIVE" },
    { id: "mock-vehicle-3", licensePlate: "59A-621.45", brand: "Honda", model: "City", color: "Bạc", status: "ACTIVE" },
  ].map((item) => normalizeVehicle({ ...item, isMock: true }));
}

export function createMockServices() {
  return [
    { id: "mock-service-1", name: "Rửa ngoại thất tiêu chuẩn", price: 80000, duration: 25, badge: "Phổ biến", status: "ACTIVE" },
    { id: "mock-service-2", name: "Vệ sinh nội thất", price: 150000, duration: 45, badge: "Chuyên sâu", status: "ACTIVE" },
    { id: "mock-service-3", name: "Chăm sóc toàn diện", price: 280000, duration: 75, badge: "Cao cấp", status: "ACTIVE" },
  ].map((item) => normalizeService({ ...item, isMock: true }));
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createMockBookings() {
  return [
    {
      bookingId: "mock-booking-1",
      bookingCode: "BK-100001",
      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
      vehicle: "Toyota Vios",
      plate: "51A-238.88",
      serviceName: "Rửa ngoại thất tiêu chuẩn",
      garageName: "WashMate Quận 7",
      garageAddress: "12 Nguyễn Văn Linh, Quận 7",
      bookingDate: offsetDate(1),
      slotTime: "08:00",
      endTime: "09:00",
      amount: 80000,
      discount: 0,
      finalAmount: 80000,
    },
    {
      bookingId: "mock-booking-2",
      bookingCode: "BK-100002",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      vehicle: "Mazda CX-5",
      plate: "30H-889.12",
      serviceName: "Vệ sinh nội thất",
      garageName: "WashMate Thủ Đức",
      garageAddress: "25 Võ Văn Ngân, Thủ Đức",
      bookingDate: offsetDate(2),
      slotTime: "13:30",
      endTime: "14:30",
      amount: 150000,
      discount: 10000,
      finalAmount: 140000,
      payment: {
        id: "mock-payment-2",
        status: "PAID",
        method: "DOMESTIC_CARD",
        transactionCode: "DEMO-TXN-2001",
        paidAt: offsetDate(-1),
      },
    },
    {
      bookingId: "mock-booking-3",
      bookingCode: "BK-100003",
      bookingStatus: "COMPLETED",
      paymentStatus: "PAID",
      vehicle: "Honda City",
      plate: "59A-621.45",
      serviceName: "Chăm sóc toàn diện",
      garageName: "WashMate Bình Thạnh",
      garageAddress: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh",
      bookingDate: offsetDate(-5),
      slotTime: "15:00",
      endTime: "16:15",
      amount: 280000,
      discount: 0,
      finalAmount: 280000,
      payment: {
        id: "mock-payment-3",
        status: "PAID",
        method: "E_WALLET",
        transactionCode: "DEMO-TXN-3001",
        paidAt: offsetDate(-5),
      },
    },
  ].map((item) => normalizeBooking({ ...item, isMock: true }));
}

export function createMockSlots(garageId) {
  return [
    { id: 1, garageId, startTime: "08:00", endTime: "09:00", maxCapacity: 4, bookedCount: 1, status: "OPEN" },
    { id: 2, garageId, startTime: "09:30", endTime: "10:30", maxCapacity: 4, bookedCount: 4, status: "FULL" },
    { id: 3, garageId, startTime: "11:00", endTime: "12:00", maxCapacity: 3, bookedCount: 1, status: "OPEN" },
    { id: 4, garageId, startTime: "13:30", endTime: "14:30", maxCapacity: 4, bookedCount: 2, status: "OPEN" },
    { id: 5, garageId, startTime: "15:00", endTime: "16:00", maxCapacity: 4, bookedCount: 0, status: "OPEN" },
    { id: 6, garageId, startTime: "17:00", endTime: "18:00", maxCapacity: 2, bookedCount: 0, status: "CLOSED" },
  ].map((item) => normalizeSlot({ ...item, isMock: true }));
}
