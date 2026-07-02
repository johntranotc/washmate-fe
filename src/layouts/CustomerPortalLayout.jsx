import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Car,
  ChevronDown,
  CreditCard,
  Gift,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Shield,
  Star,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { loyaltyApi } from "@/api/loyaltyApi";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { resolveTierInfo } from "@/lib/customer-engagement-data";
import { getAuthItem } from "@/utils/authUtils";

const defaultLoyaltyInfo = {
  tierName: "Đồng",
  availablePoints: 0,
};

const TIER_COLORS = {
  "Đồng": "#CD7F32",
  "Bạc": "#94A3B8",
  "Vàng": "#F59E0B",
  "Bạch Kim": "#3B82F6",
  "Kim Cương": "#8B5CF6",
};

const menuItems = [
  { href: "/khach-hang", label: "Tổng quan", icon: LayoutGrid, end: true },
  { href: "/khach-hang/lich-dat", label: "Lịch đặt của tôi", icon: Calendar },
  { href: "/khach-hang/xe-cua-toi", label: "Xe của tôi", icon: Car },
  { href: "/khach-hang/thanh-toan", label: "Thanh toán & hóa đơn", icon: CreditCard },
  { href: "/khach-hang/diem-thanh-vien", label: "Điểm thành viên", icon: Star },
  { href: "/khach-hang/uu-dai", label: "Ưu đãi", icon: Gift },
];

function resolveDisplayName() {
  try {
    const token = getAuthItem("token") || getAuthItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);

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

function useLoyaltyInfo() {
  const [loyaltyInfo, setLoyaltyInfo] = useState(defaultLoyaltyInfo);
  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const res = await loyaltyApi.getMyLoyalty();
        if (res) {
          const pts = Number(res.availablePoints ?? res.points ?? 0) || 0;
          const calc = resolveTierInfo(pts, res.tierName || res.tier);
          setLoyaltyInfo({ tierName: calc.tierName, availablePoints: pts });
        }
      } catch {
        // Giữ giá trị mặc định nếu API lỗi — không chặn layout
      }
    }
    fetchLoyalty();
  }, []);
  return loyaltyInfo;
}

function DashboardHeader() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(resolveDisplayName);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleProfileUpdate() {
      setCustomerName(resolveDisplayName());
    }
    window.addEventListener("washmate-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("washmate-profile-updated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    localStorage.removeItem("washmate_user_profile");
    navigate("/dang-nhap");
  };

  const getAvatarLetter = () => {
    if (customerName && typeof customerName === "string" && customerName.length > 0) {
      return customerName.charAt(0).toUpperCase();
    }
    if (customerName && typeof customerName === "object") {
      const str = customerName.name || customerName.full_name || "K";
      return String(str).charAt(0).toUpperCase();
    }
    return "K";
  };

  const renderCustomerName = () => {
    if (typeof customerName === "string") return customerName;
    if (customerName && typeof customerName === "object") {
      return customerName.name || customerName.full_name || "Khách hàng";
    }
    return "Khách hàng";
  };

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-menu"))}
          className="-ml-2 rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <Menu size={22} />
        </button>
        <span className="hidden text-sm font-semibold text-slate-500 sm:inline-block">Khu vực khách hàng</span>
      </div>

      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => navigate("/khach-hang/thong-bao")}
          title="Thông báo"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "flex cursor-pointer select-none items-center gap-2.5 rounded-xl border px-2 py-1.5 transition",
            showDropdown ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
          )}
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            {getAvatarLetter()}
          </div>
          <p className="hidden items-center gap-1.5 text-sm font-bold text-slate-800 md:flex">
            {renderCustomerName()}
            <ChevronDown size={15} className={cn("text-slate-400 transition-transform", showDropdown && "rotate-180")} />
          </p>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="mb-1 border-b border-slate-100 px-3 py-2.5 md:hidden">
              <p className="text-sm font-bold text-slate-800">{renderCustomerName()}</p>
            </div>
            {[
              [Bell, "Thông báo", "/khach-hang/thong-bao"],
              [User, "Tài khoản của tôi", "/khach-hang/tai-khoan"],
              [Shield, "Đổi mật khẩu", "/khach-hang/doi-mat-khau"],
            ].map(([Icon, label, to]) => (
              <button
                key={to}
                type="button"
                onClick={() => { setShowDropdown(false); navigate(to); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={16} /></span>
                {label}
              </button>
            ))}
            <div className="my-1 h-px bg-slate-100" />
            <button
              type="button"
              onClick={() => { setShowDropdown(false); handleLogout(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600"><LogOut size={16} /></span>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function SidebarContent({ onNavigate }) {
  const loyalty = useLoyaltyInfo();
  const tierColor = TIER_COLORS[loyalty.tierName] || "#CD7F32";

  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {/* CTA đặt lịch — hành động chính của khách */}
        <NavLink
          to="/khach-hang/dat-lich-moi"
          onClick={onNavigate}
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} /> Đặt lịch rửa xe
        </NavLink>

        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Hạng thành viên — dữ liệu thật từ /api/loyalty/me */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <NavLink
          to="/khach-hang/diem-thanh-vien"
          onClick={onNavigate}
          className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: tierColor }}>
              <Star size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900">Hạng {loyalty.tierName}</p>
              <p className="text-xs font-semibold text-slate-500">
                {new Intl.NumberFormat("vi-VN").format(loyalty.availablePoints)} điểm khả dụng
              </p>
            </div>
          </div>
        </NavLink>
      </div>
    </>
  );
}

function DashboardSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Logo />
              <button onClick={onClose} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — cố định, nhãn luôn hiển thị, đồng bộ nhịp với Staff/Admin */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}

function CustomerPortalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tiêu đề tab trình duyệt theo khu vực — như một web thật
  useEffect(() => {
    document.title = "WashMate — Khách hàng";
  }, []);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-menu", handleToggle);
    return () => window.removeEventListener("toggle-mobile-menu", handleToggle);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <DashboardSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Dòng cực kỳ quan trọng xuất dữ liệu ra ngoài AppRoutes
export default CustomerPortalLayout;
