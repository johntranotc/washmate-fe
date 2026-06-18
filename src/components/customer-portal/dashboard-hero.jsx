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
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/20 via-accent/20 to-brand-dark/10 p-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-block w-fit rounded-full border border-border bg-white/60 px-4 py-2 backdrop-blur">
            <span className="text-xs font-semibold text-muted-foreground">Khu vực khách hàng</span>
          </div>
          <h1 className="mb-3 text-4xl font-extrabold leading-tight text-foreground">
            Xin chào, {customerName}!
          </h1>
          <p className="mb-8 text-lg font-medium leading-relaxed text-muted-foreground">
            Chào mừng bạn quay lại SparkleAI / WashMate. Hôm nay bạn muốn chăm sóc chiếc xe nào?
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/khach-hang/dat-lich-moi")}
              className="rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-brand-dark"
            >
              Đặt lịch mới
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/khach-hang/xe-cua-toi")}
              className="rounded-2xl border-border font-semibold text-primary hover:bg-secondary"
            >
              Xem xe của tôi
            </Button>
          </div>
        </div>

        <div className="relative h-80">
          <img
            src="/images/hero-carwash.png"
            alt="Xe sạch bóng"
            className="absolute inset-0 size-full rounded-2xl object-cover"
          />

          <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl border border-border bg-white p-4 shadow-lg sm:-left-12">
            <div className="mb-2 flex items-center gap-2">
              <Check size={20} className="text-green-500" />
              <span className="text-sm font-semibold text-foreground">Đặt lịch trong 1 phút</span>
            </div>
            <p className="text-xs text-muted-foreground">Quy trình nhanh và đơn giản</p>
          </div>

          <div className="absolute -top-6 -right-6 max-w-xs rounded-2xl border border-border bg-white p-4 shadow-lg sm:-right-12">
            <div className="mb-2 flex items-center gap-2">
              <Droplets size={20} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Tích điểm sau mỗi lần</span>
            </div>
            <p className="text-xs text-muted-foreground">Và nhận ưu đãi độc quyền</p>
          </div>
        </div>
      </div>
    </div>
  );
}