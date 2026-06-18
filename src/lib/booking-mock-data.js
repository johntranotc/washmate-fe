import {
  normalizeGarage,
  normalizeService,
  normalizeSlot,
  normalizeVehicle,
} from "./booking-flow";
import { normalizeBooking } from "./customer-booking-data";

const mockGarageSeed = [
  {
    id: 1,
    name: "WashMate Quận 7",
    address: "12 Nguyễn Văn Linh, Quận 7, TP.HCM",
    phone: "028 1234 5678",
    openingHours: "07:00 - 20:00",
    district: "Quận 7",
    rating: 4.8,
    reviewCount: 128,
    availableSlots: 5,
    distanceKm: 1.2,
    isOpen: true,
    lat: 10.7317,
    lng: 106.7218,
    badges: ["Gần bạn nhất", "Đề xuất"],
  },
  {
    id: 2,
    name: "WashMate Thủ Đức",
    address: "25 Võ Văn Ngân, Thủ Đức, TP.HCM",
    phone: "028 2345 6789",
    openingHours: "07:00 - 20:00",
    district: "Thủ Đức",
    rating: 4.6,
    reviewCount: 95,
    availableSlots: 3,
    distanceKm: 3.5,
    isOpen: true,
    lat: 10.8504,
    lng: 106.7719,
    badges: ["Đang mở cửa"],
  },
  {
    id: 3,
    name: "WashMate Bình Thạnh",
    address: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    phone: "028 3456 7890",
    openingHours: "07:00 - 19:00",
    district: "Bình Thạnh",
    rating: 4.9,
    reviewCount: 213,
    availableSlots: 0,
    distanceKm: 2.8,
    isOpen: false,
    lat: 10.8109,
    lng: 106.7134,
    badges: ["Đánh giá cao"],
  },
];

export function createMockGarages(items = mockGarageSeed) {
  return items.map((item) => normalizeGarage({ ...item, isMock: true }));
}

export function createMockVehicles() {
  return [
    { id: "mock-vehicle-1", licensePlate: "51A-238.88", brand: "Toyota", model: "Vios", color: "Trắng ngọc trai", status: "ACTIVE" },
    { id: "mock-vehicle-2", licensePlate: "30H-889.12", brand: "Mazda", model: "CX-5", color: "Xanh đậm", status: "ACTIVE" },
    { id: "mock-vehicle-3", licensePlate: "59A-621.45", brand: "Honda", model: "City", color: "Bạc", status: "ACTIVE" },
  ].map((item) => normalizeVehicle({ ...item, isMock: true }));
}

const mockServicesBySeed = [
  // Gara 1 - Quận 7
  { id: "mock-svc-1-1", garageId: 1, name: "Rửa ngoại thất tiêu chuẩn", description: "Rửa sạch toàn bộ ngoại thất xe bằng hệ thống phun áp lực cao, an toàn và nhanh chóng.", price: 80000, duration: 25, badge: "Phổ biến", recommended: true, available: true, status: "ACTIVE" },
  { id: "mock-svc-1-2", garageId: 1, name: "Vệ sinh nội thất toàn diện", description: "Làm sạch ghế, thảm, taplo, trần xe và toàn bộ nội thất xe chuyên sâu.", price: 150000, duration: 45, badge: "Chuyên sâu", recommended: false, available: true, status: "ACTIVE" },
  { id: "mock-svc-1-3", garageId: 1, name: "Chăm sóc xe toàn diện", description: "Combo hoàn chỉnh: rửa ngoại thất + vệ sinh nội thất + đánh bóng sơ bộ bảo vệ sơn.", price: 280000, duration: 75, badge: "Cao cấp", recommended: false, available: true, status: "ACTIVE" },
  // Gara 2 - Thủ Đức
  { id: "mock-svc-2-1", garageId: 2, name: "Rửa xe nhanh", description: "Dịch vụ rửa nhanh 20 phút, phù hợp xe ô tô cỡ nhỏ và vừa khi bạn đang bận.", price: 60000, duration: 20, badge: "Nhanh chóng", recommended: true, available: true, status: "ACTIVE" },
  { id: "mock-svc-2-2", garageId: 2, name: "Đánh bóng phục hồi sơn", description: "Phục hồi độ bóng sơn xe bị phai màu do nắng, mưa và oxy hóa theo thời gian.", price: 350000, duration: 90, badge: "Chuyên nghiệp", recommended: false, available: true, status: "ACTIVE" },
  { id: "mock-svc-2-3", garageId: 2, name: "Vệ sinh khoang máy", description: "Làm sạch khoang máy, loại bỏ bụi bẩn và dầu mỡ tích tụ, tăng tuổi thọ động cơ.", price: 200000, duration: 60, badge: "Kỹ thuật", recommended: false, available: true, status: "ACTIVE" },
  // Gara 3 - Bình Thạnh
  { id: "mock-svc-3-1", garageId: 3, name: "Rửa xe cao cấp", description: "Sử dụng dung dịch nhập khẩu cao cấp, an toàn tuyệt đối cho sơn xe và môi trường.", price: 120000, duration: 35, badge: "Premium", recommended: true, available: true, status: "ACTIVE" },
  { id: "mock-svc-3-2", garageId: 3, name: "Vệ sinh & khử mùi nội thất", description: "Khử mùi, làm sạch ghế da, trần xe, thảm và toàn bộ nội thất bằng máy chuyên dụng.", price: 250000, duration: 60, badge: "Toàn diện", recommended: false, available: true, status: "ACTIVE" },
  { id: "mock-svc-3-3", garageId: 3, name: "Phủ ceramic nano bảo vệ sơn", description: "Bảo vệ sơn xe với lớp phủ ceramic nano bền vững, chống xước nhẹ và dễ vệ sinh.", price: 500000, duration: 120, badge: "Đặc biệt", recommended: false, available: true, status: "ACTIVE" },
];

export function createMockServices() {
  return mockServicesBySeed.map((item) => normalizeService({ ...item, isMock: true }));
}

export function createMockServicesForGarage(garageId) {
  return mockServicesBySeed
    .filter((item) => String(item.garageId) === String(garageId))
    .map((item) => normalizeService({ ...item, isMock: true }));
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
      bookingStatus: "PENDING_STAFF_CONFIRMATION",
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
      serviceName: "Rửa xe nhanh",
      garageName: "WashMate Thủ Đức",
      garageAddress: "25 Võ Văn Ngân, Thủ Đức",
      bookingDate: offsetDate(2),
      slotTime: "13:30",
      endTime: "14:30",
      amount: 60000,
      discount: 0,
      finalAmount: 60000,
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
      serviceName: "Chăm sóc xe toàn diện",
      garageName: "WashMate Quận 7",
      garageAddress: "12 Nguyễn Văn Linh, Quận 7",
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
    { id: 3, garageId, startTime: "11:00", endTime: "12:00", maxCapacity: 4, bookedCount: 2, status: "OPEN" },
    { id: 4, garageId, startTime: "13:30", endTime: "14:30", maxCapacity: 4, bookedCount: 2, status: "OPEN" },
    { id: 5, garageId, startTime: "15:00", endTime: "16:00", maxCapacity: 4, bookedCount: 0, status: "OPEN" },
    { id: 6, garageId, startTime: "17:00", endTime: "18:00", maxCapacity: 2, bookedCount: 0, status: "CLOSED" },
  ].map((item) => normalizeSlot({ ...item, isMock: true }));
}
