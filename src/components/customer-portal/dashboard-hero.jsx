import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export function DashboardHero() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("Khách hàng");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Áp dụng đúng logic quét linh hoạt như bên Layout
        let name =
          decoded.full_name ||
          decoded.fullName ||
          decoded.name ||
          decoded.username ||
          decoded.user_name ||
          decoded.customerName;

        if (!name && decoded.user && typeof decoded.user === "object") {
          name = decoded.user.name || decoded.user.fullName || decoded.user.full_name;
        }
        if (!name && decoded.customer && typeof decoded.customer === "object") {
          name = decoded.customer.name || decoded.customer.fullName || decoded.customer.full_name;
        }

        if (name && typeof name === "string" && isNaN(Number(name))) {
          setCustomerName(name);
        } else {
          const email = decoded.email || decoded.sub;
          if (email && typeof email === "string" && email.includes("@")) {
            setCustomerName(email.split("@")[0]);
          } else {
            setCustomerName("Khách hàng");
          }
        }
      } catch (error) {
        console.error("Lỗi giải mã token tại DashboardHero:", error);
      }
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-sm md:p-10">
      {/* Họa tiết trang trí nhẹ, không dùng ảnh nền nặng */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
          <Droplets size={13} /> WashMate — Khu vực khách hàng
        </span>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-white md:text-4xl">
          Xin chào, {customerName}!
        </h1>
        <p className="mt-2 text-sm text-blue-100 md:text-base">
          Chào mừng bạn quay lại WashMate. Hôm nay bạn muốn chăm sóc chiếc xe nào?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/khach-hang/dat-lich-moi")}
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Đặt lịch mới
          </button>
          <button
            onClick={() => navigate("/khach-hang/xe-cua-toi")}
            className="rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Xem xe của tôi
          </button>
        </div>
      </div>
    </div>
  );
}
