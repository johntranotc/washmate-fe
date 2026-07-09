import { useNavigate } from "react-router-dom";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/utils/authUtils";

export function DashboardHero() {
  const navigate = useNavigate();
  const customerName = getDisplayName("Khách hàng");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-strong p-6 shadow-sm md:p-8">
      {/* Họa tiết trang trí nhẹ, không dùng ảnh nền nặng */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-card/10" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-card/5" />

      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/15 px-3 py-1 text-xs font-bold text-white">
          <Droplets size={14} /> WashMate — Khu vực khách hàng
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white md:text-3xl">
          Xin chào, {customerName}!
        </h1>
        <p className="mt-1.5 text-sm text-primary-container">
          Chào mừng bạn quay lại WashMate. Hôm nay bạn muốn chăm sóc chiếc xe nào?
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => navigate("/khach-hang/dat-lich-moi")}
            className="bg-card px-6 text-primary-strong hover:bg-primary-container"
          >
            Đặt lịch mới
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/khach-hang/xe-cua-toi")}
            className="border-white/40 bg-transparent px-6 text-white hover:bg-card/10 hover:text-white"
          >
            Xem xe của tôi
          </Button>
        </div>
      </div>
    </div>
  );
}
