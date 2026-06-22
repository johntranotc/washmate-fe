import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Car,
  CreditCard,
  Gift,
  LayoutGrid,
  LogOut,
  Plus,
  Star,
  User,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { dashboardCustomer } from "@/lib/customer-dashboard-data";
import { loyaltyMockAccount } from "@/mocks/loyaltyMockData";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

const menuItems = [
  { href: "/khach-hang", label: "Tổng quan", icon: LayoutGrid, end: true },
  { href: "/khach-hang/lich-dat", label: "Lịch đặt của tôi", icon: Calendar },
  { href: "/khach-hang/xe-cua-toi", label: "Xe của tôi", icon: Car },
  { href: "/khach-hang/dat-lich-moi", label: "Đặt lịch mới", icon: Plus },
  { href: "/khach-hang/thanh-toan", label: "Thanh toán & hóa đơn", icon: CreditCard },
  { href: "/khach-hang/diem-thanh-vien", label: "Điểm thành viên", icon: Star },
  { href: "/khach-hang/uu-dai", label: "Ưu đãi", icon: Gift },
  { href: "/khach-hang/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/khach-hang/tai-khoan", label: "Tài khoản", icon: User },
];

function resolveDisplayName() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);

      console.log("=== TOKEN PAYLOAD (HEADER) ===", decoded);

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
        return name;
      }

      const email = decoded.email || decoded.sub;
      if (email && typeof email === "string" && email.includes("@")) {
        return email.split("@")[0];
      }
    }

    const raw = localStorage.getItem("washmate_user_profile");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.name && typeof p.name === "string") return p.name;
    }
  } catch (error) {
    console.error("Lỗi bóc tách tên hiển thị tại Layout:", error);
  }
  return "Khách hàng";
}

function DashboardHeader() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(resolveDisplayName);

  useEffect(() => {
    function handleProfileUpdate() {
      setCustomerName(resolveDisplayName());
    }
    window.addEventListener("washmate-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("washmate-profile-updated", handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("washmate_user_profile");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userEmail");
    navigate("/dang-nhap");
  };

  const getAvatarLetter = () => {
    if (customerName && typeof customerName === "string" && customerName.length > 0) {
      return customerName.charAt(0).toUpperCase();
    }
    if (customerName && typeof customerName === "object") {
      const str = customerName.name || customerName.full_name || "D";
      return String(str).charAt(0).toUpperCase();
    }
    return "D";
  };

  const renderCustomerName = () => {
    if (typeof customerName === "string") return customerName;
    if (customerName && typeof customerName === "object") {
      return customerName.name || customerName.full_name || "Khách hàng";
    }
    return "Khách hàng";
  };

  return (
    <header className="border-b border-white/40 bg-white/40 backdrop-blur-xl shadow-sm z-20">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">Khu vực khách hàng</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-full p-2 transition-colors hover:bg-secondary"
            aria-label="Thông báo"
          >
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
          </button>

          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-dark font-bold text-white text-sm">
              {getAvatarLetter()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{renderCustomerName()}</p>
              <p className="text-xs text-muted-foreground">
                Hạng {loyaltyMockAccount.tierName} • {loyaltyMockAccount.availablePoints.toLocaleString("vi-VN")} điểm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full p-2 transition-colors hover:bg-secondary"
            aria-label="Đăng xuất"
          >
            <LogOut size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white/40 shadow-xl backdrop-blur-2xl font-sans">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200",
                isActive
                  ? "bg-blue-500/15 text-blue-800 shadow-md shadow-blue-500/20 border border-blue-500/30 backdrop-blur-md font-semibold"
                  : "text-slate-500 hover:bg-gray-100 hover:text-slate-900",
              )
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function CustomerPortalLayout() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Background Image for the whole portal */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/hero-carwash.png"
          alt="Portal Background"
          className="size-full object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-slate-100/70 backdrop-blur-[40px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto no-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

// Dòng cực kỳ quan trọng xuất dữ liệu ra ngoài AppRoutes
export default CustomerPortalLayout;