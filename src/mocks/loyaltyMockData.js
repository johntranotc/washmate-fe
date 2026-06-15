export const loyaltyMockAccount = {
  id: "loyalty-demo-1",
  availablePoints: 1250,
  totalEarnedPoints: 1750,
  totalRedeemedPoints: 500,
  tier: "SILVER",
  tierName: "Bạc",
  nextTier: "GOLD",
  nextTierName: "Vàng",
  pointsToNextTier: 750,
  progressPercent: 62.5,
};

export const loyaltyTierMockData = [
  { code: "BRONZE", name: "Đồng", minimumPoints: 0, benefit: "Tích điểm cho mọi dịch vụ" },
  { code: "SILVER", name: "Bạc", minimumPoints: 500, benefit: "Ưu tiên nhận ưu đãi thành viên" },
  { code: "GOLD", name: "Vàng", minimumPoints: 2000, benefit: "Quà sinh nhật và ưu đãi đặc biệt" },
  { code: "DIAMOND", name: "Kim cương", minimumPoints: 5000, benefit: "Đặc quyền chăm sóc xe cao cấp" },
];

export const loyaltyTransactionMockData = [
  {
    id: "point-1",
    type: "EARN",
    points: 250,
    description: "Hoàn tất và thanh toán lịch rửa xe cao cấp",
    createdAt: "2026-06-11T08:05:00.000Z",
  },
  {
    id: "point-2",
    type: "REDEEM",
    points: -500,
    description: "Đổi voucher giảm 50.000đ",
    createdAt: "2026-05-28T10:30:00.000Z",
  },
  {
    id: "point-3",
    type: "ADJUSTMENT",
    points: 100,
    description: "Điều chỉnh điểm tri ân khách hàng",
    createdAt: "2026-05-17T03:20:00.000Z",
  },
  {
    id: "point-4",
    type: "ROLLBACK",
    points: -80,
    description: "Hoàn điểm do lịch đặt được hoàn tiền",
    createdAt: "2026-05-02T09:15:00.000Z",
  },
];
