import { Outlet } from "react-router-dom";
import { Car, Droplets, ShieldCheck, Sparkles } from "lucide-react";
import Card from "../components/common/Card";

const highlights = [
  { icon: Car, label: "Quản lý đội xe & lịch rửa thông minh" },
  { icon: Droplets, label: "Đặt lịch rửa xe chỉ trong vài bước" },
  { icon: ShieldCheck, label: "Bảo mật tài khoản & thanh toán an toàn" },
];

function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-[var(--bg-main)]">
      <Card className="w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="relative hidden md:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue-dark)] overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15">
              <Sparkles size={26} />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
              WashMate
            </h1>
            <p className="mt-3 max-w-sm text-white/85 leading-relaxed">
              Nền tảng đặt lịch &amp; quản lý rửa xe thông minh, giúp xe của
              bạn luôn sạch bóng mỗi ngày.
            </p>
          </div>

          <ul className="relative z-10 mt-10 space-y-4">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-medium"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15">
                  <Icon size={18} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-8 top-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AuthLayout;
