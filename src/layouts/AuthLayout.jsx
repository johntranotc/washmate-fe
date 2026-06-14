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
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 flex-col px-5 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
            Về trang chủ
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
        <footer className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SparkleAI / WashMate. Bảo lưu mọi quyền.
        </footer>
      </div>

      <div className="relative hidden w-[44%] overflow-hidden bg-primary lg:block">
        <img
          src="/images/auth-side.png"
          alt="Gara rửa xe hiện đại của SparkleAI"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062a52]/90 via-[#062a52]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Sparkles className="size-4" />
            Nền tảng rửa xe thông minh
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight">
            Chăm sóc xe của bạn dễ dàng hơn bao giờ hết
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {highlights.map((h) => (
              <li key={h.label} className="flex items-center gap-3 text-[15px] text-white/90">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <h.icon className="size-4.5" />
                </span>
                {h.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
