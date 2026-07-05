import { Link, Outlet } from "react-router-dom";
import { Sparkles, Clock, Activity, Gift } from "lucide-react";
import { Logo } from "@/components/site/logo";

const highlights = [
  { icon: Clock, label: "Đặt lịch rửa xe chỉ trong 1 phút" },
  { icon: Activity, label: "Theo dõi tiến độ theo thời gian thực" },
  { icon: Gift, label: "Tích điểm và nhận đặc quyền thành viên" },
];

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Full-width Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/auth-side.png"
          alt="Gara rửa xe hiện đại của WashMate"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>

      {/* Top Right Navigation */}
      <div className="absolute right-6 top-6 z-20">
        <Link
          to="/"
          className="rounded-full bg-card/10 px-6 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-colors hover:bg-card/20"
        >
          Về trang chủ
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
        
        {/* Left Side: Brand & Highlights */}
        <div className="flex w-full flex-col justify-center text-white lg:w-1/2 lg:pr-8">
          <div className="mb-10 w-fit rounded-2xl bg-card px-6 py-3 shadow-floating">
            <Logo />
          </div>
          
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-card/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="size-4 text-primary" />
            Nền tảng rửa xe thông minh
          </span>
          
          <h2 className="text-balance text-4xl font-extrabold leading-tight lg:text-5xl">
            Chăm sóc xe của bạn dễ dàng hơn bao giờ hết
          </h2>
          
          <ul className="mt-8 flex flex-col gap-5">
            {highlights.map((h) => (
              <li key={h.label} className="flex items-center gap-4 text-lg text-white/90">
                <span className="flex size-12 items-center justify-center rounded-xl bg-card/10 backdrop-blur-md">
                  <h.icon className="size-5 text-primary" />
                </span>
                {h.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-floating lg:p-12">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
