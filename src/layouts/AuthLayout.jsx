import { Link, Outlet } from "react-router-dom";
import { AuthIcon } from "@/components/auth/auth-icon";

const benefits = [
  {
    icon: "clock",
    title: "Đặt lịch rửa xe chỉ trong 1 phút",
    subtitle: "Nhanh chóng, tiện lợi, tiết kiệm thời gian",
  },
  {
    icon: "activity",
    title: "Theo dõi tiến độ theo thời gian thực",
    subtitle: "Cập nhật trạng thái dịch vụ mọi lúc, mọi nơi",
  },
  {
    icon: "gift",
    title: "Tích điểm và nhận đặc quyền thành viên",
    subtitle: "Nhiều ưu đãi hấp dẫn chỉ dành riêng cho bạn",
  },
];

const stats = [
  { icon: "shield-check", label: "An toàn & Bảo mật" },
  { icon: "users", label: "10.000+ Khách hàng tin dùng" },
  { icon: "star", label: "4.9/5 Đánh giá từ khách hàng" },
];

function BrandMark({ className }) {
  return (
    <Link to="/" className={className} aria-label="WashMate - Trang chủ">
      <span className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-cta">
          <AuthIcon name="washmate-drop" className="size-6" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight text-white">WashMate</span>
          <span className="mt-1 text-xs font-bold tracking-wide text-primary-bright">Rửa xe thông minh</span>
        </span>
      </span>
    </Link>
  );
}

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/auth/login-bg.png"
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy/60 to-navy-deep/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-deep/80 to-transparent" />
      </div>

      {/* Về trang chủ */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-card/20"
        >
          <AuthIcon name="home" className="size-4" />
          Về trang chủ
        </Link>
      </div>

      {/* Main */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 lg:py-8">
        {/* Trái: branding & benefits (ẩn trên mobile, form được ưu tiên) */}
        <div className="hidden w-full max-w-xl flex-col lg:flex">
          <BrandMark className="w-fit" />

          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-card/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
            <AuthIcon name="sparkles" className="size-4 text-primary-bright" />
            Nền tảng rửa xe thông minh
          </span>

          <h2 className="mt-5 text-balance text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Chăm sóc xe của bạn
            <span className="block">dễ dàng hơn bao giờ hết</span>
          </h2>

          <ul className="mt-8 flex flex-col gap-5">
            {benefits.map((benefit) => (
              <li key={benefit.icon} className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/15 bg-card/10 backdrop-blur-md">
                  <AuthIcon name={benefit.icon} className="size-5 text-primary-bright" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-white">{benefit.title}</span>
                  <span className="text-sm text-white/70">{benefit.subtitle}</span>
                </span>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5">
            {stats.map((stat) => (
              <li key={stat.icon} className="flex items-center gap-2 text-xs font-semibold text-white/85">
                <AuthIcon name={stat.icon} className="size-4 text-primary-bright" />
                {stat.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Brand thu gọn trên mobile/tablet */}
        <BrandMark className="lg:hidden" />

        {/* Phải: card form */}
        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-floating sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
