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
import { cn } from "@/lib/utils";

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

function DashboardHeader() {
  const navigate = useNavigate();

  const customerName =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    dashboardCustomer.name;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userEmail");
    navigate("/dang-nhap");
  };

  return (
    <header className="border-b border-border bg-white">
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
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-brand-dark" />
            <div>
              <p className="text-sm font-semibold text-foreground">{customerName}</p>
              <p className="text-xs text-muted-foreground">
                Hạng {dashboardCustomer.memberTier} • {dashboardCustomer.points.toLocaleString("vi-VN")} điểm
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
    <aside className="w-64 border-r border-border bg-white">
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold leading-tight transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
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
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto bg-secondary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CustomerPortalLayout;
