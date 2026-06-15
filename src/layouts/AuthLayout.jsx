import { Link, Outlet } from "react-router-dom";
import { Activity, Clock, Gift, Sparkles } from "lucide-react";
import { Logo } from "@/components/site/logo";

const highlights = [
  { icon: Clock, label: "Đặt lịch rửa xe chỉ trong 1 phút" },
  { icon: Activity, label: "Theo dõi tiến độ theo thời gian thực" },
  { icon: Gift, label: "Tích điểm và nhận đặc quyền thành viên" },
];

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <div className="flex flex-1 flex-col px-5 py-7 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-primary">Về trang chủ</Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md"><Outlet /></div>
        </main>
        <footer className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} SparkleAI / WashMate. Bảo lưu mọi quyền.</footer>
      </div>
      <aside className="relative hidden w-[44%] overflow-hidden bg-primary lg:block">
        <img src="/images/auth-side.png" alt="Gara chăm sóc xe hiện đại" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062a52]/95 via-[#075dce]/45 to-[#0b8cff]/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"><Sparkles className="size-4" /> Nền tảng rửa xe thông minh</span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight">Chăm sóc xe dễ dàng hơn, minh bạch hơn mỗi ngày</h2>
          <ul className="mt-6 space-y-3">
            {highlights.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-3 text-[15px] text-white/90"><span className="grid size-9 place-items-center rounded-xl bg-white/15"><Icon className="size-4" /></span>{label}</li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
}
