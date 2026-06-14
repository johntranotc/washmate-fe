export const services = [
  {
    slug: "rua-ngoai-that",
    name: "Rửa ngoại thất tiêu chuẩn",
    category: "Rửa ngoại thất",
    description:
      "Làm sạch toàn bộ bề mặt ngoại thất, loại bỏ bụi bẩn và vết bám, trả lại vẻ sáng bóng cho xe.",
    price: "Từ 80.000đ",
    duration: "25 phút",
    badge: "Phổ biến",
    image: "/images/service-exterior.png",
  },
  {
    slug: "ve-sinh-noi-that",
    name: "Vệ sinh nội thất",
    category: "Vệ sinh nội thất",
    description:
      "Hút bụi, làm sạch ghế, thảm, bảng điều khiển và khử mùi, mang lại khoang xe tươi mới.",
    price: "Từ 150.000đ",
    duration: "45 phút",
    badge: "Chuyên sâu",
    image: "/images/service-interior.png",
  },
  {
    slug: "cham-soc-toan-dien",
    name: "Chăm sóc toàn diện",
    category: "Chăm sóc toàn diện",
    description:
      "Gói chăm sóc cả trong lẫn ngoài, kết hợp rửa, vệ sinh nội thất và làm mới toàn bộ chiếc xe.",
    price: "Từ 280.000đ",
    duration: "75 phút",
    badge: "Cao cấp",
    image: "/images/service-full.png",
  },
  {
    slug: "phu-bong-bao-ve",
    name: "Phủ bóng bảo vệ",
    category: "Phủ bóng",
    description:
      "Phủ lớp bảo vệ bóng gương, tăng độ sáng và bảo vệ sơn xe khỏi tác động môi trường.",
    price: "Từ 350.000đ",
    duration: "90 phút",
    badge: "Cao cấp",
    image: "/images/service-coating.png",
  },
  {
    slug: "ve-sinh-khoang-may",
    name: "Vệ sinh khoang máy",
    category: "Vệ sinh khoang máy",
    description:
      "Làm sạch khoang máy an toàn, loại bỏ dầu mỡ và bụi bẩn bằng kỹ thuật chuyên dụng.",
    price: "Từ 220.000đ",
    duration: "60 phút",
    badge: "Kỹ thuật",
    image: "/images/service-engine.png",
  },
];

export const serviceCategories = [
  "Tất cả",
  "Rửa ngoại thất",
  "Vệ sinh nội thất",
  "Chăm sóc toàn diện",
  "Phủ bóng",
  "Vệ sinh khoang máy",
];

export const plans = [
  {
    name: "Gói Cơ Bản",
    price: "80.000đ",
    duration: "25 phút",
    features: [
      "Rửa ngoại thất",
      "Làm sạch kính",
      "Xịt khô nhanh",
      "Kiểm tra bề mặt xe",
    ],
  },
  {
    name: "Gói Tiêu Chuẩn",
    price: "180.000đ",
    duration: "50 phút",
    features: [
      "Rửa ngoại thất",
      "Vệ sinh nội thất cơ bản",
      "Làm sạch thảm",
      "Khử mùi nhẹ",
      "Tích điểm thành viên",
    ],
  },
  {
    name: "Gói Cao Cấp",
    price: "320.000đ",
    duration: "90 phút",
    featured: true,
    badge: "Được yêu thích",
    features: [
      "Rửa ngoại thất chuyên sâu",
      "Vệ sinh nội thất",
      "Phủ bóng nhanh",
      "Khử mùi cao cấp",
      "Ưu tiên đặt lịch",
      "Tích điểm thưởng cao hơn",
    ],
  },
];

export const tiers = [
  {
    name: "Đồng",
    condition: "Từ 0 điểm",
    discount: "Giảm 5%",
    badge: "/badges/dong.png",
    color: "#B07B4F",
    ring: "ring-[#E2C4A6]",
    pedestal: "from-[#3a2a1d] to-[#1c130c]",
    benefits: [
      "Tích điểm sau mỗi lần rửa",
      "Ưu đãi chào mừng",
      "Nhắc lịch rửa xe tự động",
    ],
  },
  {
    name: "Bạc",
    condition: "Từ 500 điểm",
    discount: "Giảm 8%",
    badge: "/badges/bac.png",
    color: "#8A97A6",
    ring: "ring-[#D7DEE6]",
    pedestal: "from-[#2c3340] to-[#15191f]",
    benefits: [
      "Toàn bộ quyền lợi hạng Đồng",
      "Ưu tiên đặt lịch",
      "Quà tặng sinh nhật",
    ],
  },
  {
    name: "Vàng",
    condition: "Từ 1.500 điểm",
    discount: "Giảm 12%",
    badge: "/badges/vang.png",
    color: "#D6A312",
    ring: "ring-[#F3DD8E]",
    pedestal: "from-[#3c2f0c] to-[#1d1605]",
    benefits: [
      "Toàn bộ quyền lợi hạng Bạc",
      "Tích điểm nhân đôi",
      "Ưu đãi độc quyền hằng tháng",
    ],
  },
  {
    name: "Bạch Kim",
    condition: "Từ 3.500 điểm",
    discount: "Giảm 15%",
    badge: "/badges/bach-kim.png",
    color: "#5C9BC4",
    ring: "ring-[#BFE0F0]",
    pedestal: "from-[#1f3340] to-[#0f1a20]",
    benefits: [
      "Toàn bộ quyền lợi hạng Vàng",
      "Dịch vụ ưu tiên tại gara",
      "Chăm sóc khách hàng riêng",
    ],
  },
  {
    name: "Kim Cương",
    condition: "Từ 8.000 điểm",
    discount: "Giảm 20%",
    badge: "/badges/kim-cuong.png",
    color: "#7B5FD0",
    ring: "ring-[#CBBBF2]",
    pedestal: "from-[#2c2148] to-[#150f24]",
    benefits: [
      "Toàn bộ quyền lợi hạng Bạch Kim",
      "Quản gia chăm sóc riêng",
      "Đặc quyền sự kiện VIP",
    ],
  },
];

export const steps = [
  {
    title: "Chọn xe của bạn",
    description: "Thêm và chọn chiếc xe cần được chăm sóc.",
  },
  {
    title: "Chọn dịch vụ",
    description: "Lựa chọn gói dịch vụ phù hợp với nhu cầu.",
  },
  {
    title: "Chọn gara và khung giờ",
    description: "Tìm gara gần bạn và đặt khung giờ thuận tiện.",
  },
  {
    title: "Thanh toán",
    description: "Thanh toán nhanh chóng và minh bạch.",
  },
  {
    title: "Check-in tại gara",
    description: "Đến gara và check-in bằng mã đặt lịch.",
  },
  {
    title: "Theo dõi quá trình",
    description: "Theo dõi tiến độ rửa xe theo thời gian thực.",
  },
  {
    title: "Hoàn tất và nhận điểm",
    description: "Nhận xe sạch bóng và tích điểm thưởng.",
  },
];

export const testimonials = [
  {
    name: "Nguyễn Minh Quân",
    avatar: "/avatars/khach-1.png",
    rating: 5,
    content:
      "Đặt lịch chỉ trong một phút, xe sạch bóng và còn được tích điểm. Trải nghiệm rất chuyên nghiệp.",
    service: "Chăm sóc toàn diện",
  },
  {
    name: "Trần Thu Hà",
    avatar: "/avatars/khach-2.png",
    rating: 5,
    content:
      "Mình theo dõi được tiến độ rửa xe ngay trên điện thoại, không phải chờ đợi mệt mỏi như trước.",
    service: "Vệ sinh nội thất",
  },
  {
    name: "Lê Hoàng Nam",
    avatar: "/avatars/khach-3.png",
    rating: 5,
    content:
      "Dịch vụ phủ bóng cực kỳ ấn tượng, xe sáng như mới. Nhân viên thân thiện và đúng giờ.",
    service: "Phủ bóng bảo vệ",
  },
];
