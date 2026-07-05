export const services = [
  {
    slug: "rua-ngoai-that",
    name: "Rửa ngoại thất",
    category: "Rửa ngoại thất",
    description: "Làm sạch bụi bẩn, bùn đất và vết bám trên toàn bộ bề mặt xe bằng quy trình an toàn cho lớp sơn.",
    price: "Từ 80.000đ",
    duration: "25 phút",
    badge: "Phổ biến",
    image: "/images/service-exterior.png",
  },
  {
    slug: "ve-sinh-noi-that",
    name: "Vệ sinh nội thất",
    category: "Vệ sinh nội thất",
    description: "Hút bụi, làm sạch ghế, thảm, bảng điều khiển và khử mùi để khoang xe luôn thoáng sạch.",
    price: "Từ 150.000đ",
    duration: "45 phút",
    badge: "Chuyên sâu",
    image: "/images/service-interior.png",
  },
  {
    slug: "cham-soc-toan-dien",
    name: "Chăm sóc toàn diện",
    category: "Chăm sóc toàn diện",
    description: "Kết hợp chăm sóc nội và ngoại thất trong một quy trình đồng bộ, phù hợp cho xe cần làm mới toàn diện.",
    price: "Từ 280.000đ",
    duration: "75 phút",
    badge: "Cao cấp",
    image: "/images/service-full.png",
  },
  {
    slug: "phu-bong-bao-duong",
    name: "Phủ bóng và bảo dưỡng",
    category: "Phủ bóng",
    description: "Tăng độ bóng, bảo vệ bề mặt sơn và hạn chế tác động từ thời tiết bằng sản phẩm chuyên dụng.",
    price: "Từ 350.000đ",
    duration: "90 phút",
    badge: "Bảo vệ sơn",
    image: "/images/service-coating.png",
  },
  {
    slug: "ve-sinh-khoang-may",
    name: "Vệ sinh khoang máy",
    category: "Vệ sinh khoang máy",
    description: "Loại bỏ dầu mỡ và bụi bẩn trong khoang máy bằng kỹ thuật an toàn cho các chi tiết điện.",
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
    features: ["Rửa ngoại thất", "Làm sạch kính", "Xịt khô nhanh", "Kiểm tra bề mặt xe"],
  },
  {
    name: "Gói Tiêu Chuẩn",
    price: "180.000đ",
    duration: "50 phút",
    features: ["Rửa ngoại thất", "Vệ sinh nội thất cơ bản", "Làm sạch thảm", "Khử mùi nhẹ", "Tích điểm thành viên"],
  },
  {
    name: "Gói Cao Cấp",
    price: "320.000đ",
    duration: "90 phút",
    featured: true,
    badge: "Được yêu thích",
    features: ["Rửa ngoại thất chuyên sâu", "Vệ sinh nội thất", "Phủ bóng nhanh", "Khử mùi cao cấp", "Ưu tiên đặt lịch", "Tích điểm cao hơn"],
  },
];

export const tiers = [
  {
    name: "Đồng",
    condition: "Từ 0 điểm",
    discount: "Giảm 5%",
    badge: "/badges/dong.png",
    color: "var(--tier-bronze)",
    pedestal: "from-tier-bronze-ink to-foreground",
    benefits: ["Tích điểm sau mỗi lần rửa", "Ưu đãi chào mừng", "Nhắc lịch chăm sóc xe"],
  },
  {
    name: "Bạc",
    condition: "Từ 500 điểm",
    discount: "Giảm 8%",
    badge: "/badges/bac.png",
    color: "var(--tier-silver)",
    pedestal: "from-tier-silver-ink to-foreground",
    benefits: ["Toàn bộ quyền lợi hạng Đồng", "Ưu tiên đặt lịch", "Quà tặng sinh nhật"],
  },
  {
    name: "Vàng",
    condition: "Từ 1.500 điểm",
    discount: "Giảm 12%",
    badge: "/badges/vang.png",
    color: "var(--tier-gold)",
    pedestal: "from-tier-gold-ink to-foreground",
    benefits: ["Toàn bộ quyền lợi hạng Bạc", "Tích điểm nhân đôi", "Ưu đãi hàng tháng"],
  },
  {
    name: "Bạch Kim",
    condition: "Từ 3.500 điểm",
    discount: "Giảm 15%",
    badge: "/badges/bach-kim.png",
    color: "var(--tier-platinum)",
    pedestal: "from-tier-platinum to-foreground",
    benefits: ["Toàn bộ quyền lợi hạng Vàng", "Ưu tiên tại gara", "Hỗ trợ chuyên biệt"],
  },
  {
    name: "Kim Cương",
    condition: "Từ 8.000 điểm",
    discount: "Giảm 20%",
    badge: "/badges/kim-cuong.png",
    color: "var(--tier-diamond)",
    pedestal: "from-tier-diamond to-foreground",
    benefits: ["Toàn bộ quyền lợi hạng Bạch Kim", "Chăm sóc riêng", "Đặc quyền sự kiện"],
  },
];

export const steps = [
  { title: "Chọn xe của bạn", description: "Thêm và chọn chiếc xe cần được chăm sóc." },
  { title: "Chọn dịch vụ", description: "Lựa chọn gói phù hợp với nhu cầu." },
  { title: "Chọn gara và khung giờ", description: "Tìm gara gần bạn và thời gian thuận tiện." },
  { title: "Thanh toán", description: "Xác nhận chi phí và thanh toán minh bạch." },
  { title: "Check-in tại gara", description: "Đến gara và check-in bằng mã đặt lịch." },
  { title: "Theo dõi quá trình", description: "Theo dõi tiến độ theo thời gian thực." },
  { title: "Hoàn tất và nhận điểm", description: "Nhận xe sạch bóng và tích điểm tự động." },
];

export const testimonials = [
  { name: "Nguyễn Minh Quân", avatar: "/avatars/khach-1.png", rating: 5, content: "Đặt lịch chỉ trong một phút, xe sạch bóng và còn được tích điểm. Trải nghiệm rất chuyên nghiệp.", service: "Chăm sóc toàn diện" },
  { name: "Trần Thu Hà", avatar: "/avatars/khach-2.png", rating: 5, content: "Mình theo dõi được tiến độ ngay trên điện thoại nên chủ động thời gian hơn rất nhiều.", service: "Vệ sinh nội thất" },
  { name: "Lê Hoàng Nam", avatar: "/avatars/khach-3.png", rating: 5, content: "Dịch vụ phủ bóng rất ấn tượng, chi phí rõ ràng và nhân viên đúng giờ.", service: "Phủ bóng và bảo dưỡng" },
];
