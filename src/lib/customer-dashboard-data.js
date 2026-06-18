// Dữ liệu mẫu cho khu vực khách hàng (Customer Portal)

export const dashboardCustomer = {
  name: "Ngữ Trần",
  email: "ngutran@example.com",
  memberTier: "Vàng",
  points: 1250,
  pointsToNextTier: 250,
  nextTier: "Bạch Kim",
};

export const upcomingBookings = [
  {
    id: "1",
    service: "Rửa ngoại thất tiêu chuẩn",
    vehicle: "Toyota Vios – 51A-238.88",
    garage: "WashMate Quận 7",
    dateTime: "Thứ Bảy, 22/06/2026 – 09:30",
    status: "Chờ thanh toán",
    amount: "80.000đ",
  },
  {
    id: "2",
    service: "Chăm sóc toàn diện",
    vehicle: "Mazda CX-5 – 30H-889.12",
    garage: "WashMate Thủ Đức",
    dateTime: "Chủ Nhật, 23/06/2026 – 15:00",
    status: "Đã xác nhận",
    amount: "320.000đ",
  },
  {
    id: "3",
    service: "Vệ sinh nội thất",
    vehicle: "Honda City – 59A-621.45",
    garage: "WashMate Bình Thạnh",
    dateTime: "Thứ Hai, 24/06/2026 – 10:00",
    status: "Đang rửa xe",
    amount: "150.000đ",
  },
];

export const userVehicles = [
  {
    id: "1",
    brand: "Toyota",
    model: "Vios",
    licensePlate: "51A-238.88",
    color: "Trắng ngọc trai",
    status: "Đang sử dụng",
    lastService: "Rửa ngoại thất – 22/06/2026",
  },
  {
    id: "2",
    brand: "Mazda",
    model: "CX-5",
    licensePlate: "30H-889.12",
    color: "Xanh đậm",
    status: "Đang sử dụng",
    lastService: "Chăm sóc toàn diện – 23/06/2026",
  },
  {
    id: "3",
    brand: "Honda",
    model: "City",
    licensePlate: "59A-621.45",
    color: "Bạc",
    status: "Đang sử dụng",
    lastService: "Chưa có lịch gần đây",
  },
];

export const careTips = [
  {
    id: "1",
    title: "Xe của bạn đã 14 ngày chưa rửa",
    description: "Đặt lịch rửa ngoại thất để giữ xe luôn sạch bóng và bảo vệ lớp sơn.",
    icon: "droplet",
  },
  {
    id: "2",
    title: "Nội thất cần được làm sạch định kỳ",
    description: "Vệ sinh nội thất giúp khoang xe thoáng, sạch và dễ chịu hơn.",
    icon: "sofa",
  },
  {
    id: "3",
    title: "Bạn thường đặt lịch vào cuối tuần",
    description: "Hãy chọn sớm khung giờ phù hợp để tránh hết slot vào giờ cao điểm.",
    icon: "calendar",
  },
];

export const recentNotifications = [
  {
    id: "1",
    title: "Lịch đặt đang chờ thanh toán",
    message: "Bạn có một lịch đặt cần hoàn tất thanh toán để được xác nhận.",
    time: "5 phút trước",
    read: false,
  },
  {
    id: "2",
    title: "Điểm thưởng sẽ được cập nhật sau khi hoàn tất dịch vụ",
    message: "WashMate sẽ cộng điểm khi lịch đặt hoàn tất và thanh toán hợp lệ.",
    time: "1 giờ trước",
    read: true,
  },
  {
    id: "3",
    title: "Ưu đãi cuối tuần đang chờ bạn",
    message: "Nhận ưu đãi khi đặt lịch chăm sóc xe vào cuối tuần này.",
    time: "Hôm nay",
    read: false,
  },
];

export const sampleVehicles = [
  {
    id: "1",
    brand: "Toyota",
    model: "Vios",
    licensePlate: "51A-238.88",
    color: "Trắng ngọc trai",
    type: "Sedan",
    year: "2022",
    status: "using",
    lastService: "Rửa ngoại thất – 22/06/2026",
  },
  {
    id: "2",
    brand: "Mazda",
    model: "CX-5",
    licensePlate: "30H-889.12",
    color: "Xanh đậm",
    type: "SUV",
    year: "2021",
    status: "using",
    lastService: "Chăm sóc toàn diện – 23/06/2026",
  },
  {
    id: "3",
    brand: "Honda",
    model: "City",
    licensePlate: "59A-621.45",
    color: "Bạc",
    type: "Sedan",
    year: "2023",
    status: "using",
    lastService: "Chưa có lịch gần đây",
  },
];
