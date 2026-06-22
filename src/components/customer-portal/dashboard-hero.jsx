import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplets, Check } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export function DashboardHero() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("Khách hàng");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // In log ra để đồng bộ kiểm tra
        console.log("=== TOKEN PAYLOAD (HERO) ===", decoded);

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
    <div 
      className="relative w-full min-h-[400px] rounded-2xl overflow-hidden bg-cover bg-center bg-no-repeat flex items-center p-8 md:p-12 mb-8 shadow-md"
      style={{ backgroundImage: 'url("/images/hero-carwash.png")' }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 rounded-3xl max-w-xl">
        <div className="mb-4 inline-block w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-semibold text-white/90">Khu vực khách hàng</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Xin chào, {customerName}!
        </h1>
        <p className="text-sm md:text-base text-white/90 mb-8">
          Chào mừng bạn quay lại WashMate. Hôm nay bạn muốn chăm sóc chiếc xe nào?
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => navigate("/khach-hang/dat-lich-moi")}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all px-6 py-3 rounded-xl font-semibold"
          >
            Đặt lịch mới
          </button>
          <button 
            onClick={() => navigate("/khach-hang/xe-cua-toi")}
            className="bg-black/30 hover:bg-black/40 text-white border border-white/20 backdrop-blur-sm transition-all px-6 py-3 rounded-xl font-semibold"
          >
            Xem xe của tôi
          </button>
        </div>
      </div>
    </div>
  );
}