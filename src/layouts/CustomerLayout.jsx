import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  Calendar,
  Car,
  ClipboardList,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Sparkles,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";

const navItems = [
  { label: "Bảng điều khiển", path: "/customer", icon: LayoutDashboard, end: true },
  { label: "Xe của tôi", path: "/customer/vehicles", icon: Car },
  { label: "Dịch vụ", path: "/customer/services", icon: Wrench },
  { label: "Đặt lịch", path: "/customer/bookings/create", icon: Calendar },
  { label: "Lịch đặt của tôi", path: "/customer/bookings", icon: ClipboardList },
  { label: "Thanh toán", path: "/customer/payments", icon: CreditCard },
  { label: "Hóa đơn", path: "/customer/invoices", icon: Receipt },
  { label: "Điểm thưởng", path: "/customer/loyalty", icon: Award },
  { label: "Ưu đãi", path: "/customer/offers", icon: Gift },
  { label: "Thông báo", path: "/customer/notifications", icon: Bell },
  { label: "Hồ sơ cá nhân", path: "/customer/profile", icon: UserCircle },
];

function CustomerLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const customerName =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    "Khách hàng";

  const avatarInitial = customerName.trim().charAt(0).toUpperCase() || "K";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"
        : "text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]"
    }`;

  const sidebarContent = (
    <>
      <Link to="/customer" className="flex items-center gap-3 px-2 pb-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-blue)] text-white shadow-[0_12px_28px_rgba(11,140,255,0.28)]">
          <Sparkles size={22} />
        </span>
        <span>
          <span className="block text-lg font-extrabold tracking-tight text-[var(--text-main)]">
            WashMate
          </span>
          <span className="block text-xs font-medium text-[var(--text-muted)]">
            Customer Portal
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-1">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={() => setMobileNavOpen(false)}
            className={navLinkClass}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-[var(--border-soft)] bg-white px-4 py-6 lg:flex">
          {sidebarContent}
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white px-4 py-6 shadow-2xl">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)]"
                  aria-label="Đóng menu"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        <div className="flex min-h-screen w-full flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-[var(--border-soft)] p-2 text-[var(--text-main)] lg:hidden"
                aria-label="Mở menu"
              >
                <Menu size={20} />
              </button>

              <div className="relative flex-1 max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--bg-main)] py-2.5 pl-11 pr-4 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/15"
                />
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-main)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                  aria-label="Thông báo"
                >
                  <Bell size={18} />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
                </button>

                <div className="hidden items-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-4 py-2 text-sm font-semibold text-[var(--brand-blue)] sm:flex">
                  <Award size={16} />
                  1.250 điểm
                </div>

                <div className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white px-2 py-1.5 pr-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
                    {avatarInitial}
                  </span>
                  <span className="hidden text-sm font-semibold text-[var(--text-main)] md:block">
                    {customerName}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1180px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CustomerLayout;
