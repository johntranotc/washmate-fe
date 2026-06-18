export const promotionMockData = [
  {
    id: "promo-1",
    code: "WELCOME20",
    title: "Giảm 20% cho lần chăm sóc tiếp theo",
    description: "Áp dụng cho gói rửa xe cao cấp tại mọi gara.",
    discountLabel: "Giảm 20%",
    status: "ACTIVE",
    memberOnly: false,
    expiresAt: "2026-07-31T23:59:59.000Z",
  },
  {
    id: "promo-2",
    code: "MEMBER50",
    title: "Đặc quyền thành viên Bạc",
    description: "Giảm trực tiếp 50.000đ cho hóa đơn từ 250.000đ.",
    discountLabel: "Giảm 50.000đ",
    status: "MEMBER",
    memberOnly: true,
    expiresAt: "2026-08-15T23:59:59.000Z",
  },
  {
    id: "promo-3",
    code: "WEEKEND15",
    title: "Cuối tuần xe sạch",
    description: "Ưu đãi dịch vụ vệ sinh nội thất vào thứ Bảy và Chủ nhật.",
    discountLabel: "Giảm 15%",
    status: "EXPIRING",
    memberOnly: false,
    expiresAt: "2026-06-30T23:59:59.000Z",
  },
];

export const rewardMockData = [
  {
    id: "reward-1",
    name: "Voucher giảm 50.000đ",
    description: "Dùng cho hóa đơn dịch vụ từ 200.000đ.",
    pointsRequired: 500,
    stock: 20,
  },
  {
    id: "reward-2",
    name: "Miễn phí rửa xe cơ bản",
    description: "Áp dụng một lần tại gara tham gia chương trình.",
    pointsRequired: 1200,
    stock: 8,
  },
  {
    id: "reward-3",
    name: "Nâng cấp gói chăm sóc",
    description: "Nâng cấp từ gói cơ bản lên gói cao cấp.",
    pointsRequired: 1800,
    stock: 5,
  },
];
