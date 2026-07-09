import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Car,
  ChevronDown,
  CreditCard,
  Gift,
  LayoutGrid,
  LogOut,
  Plus,
  Shield,
  Star,
  User,
} from "lucide-react";
import PortalShell from "@/components/shared/PortalShell";
import { loyaltyApi } from "@/api/loyaltyApi";
import { cn } from "@/lib/utils";
import { resolveTierInfo } from "@/lib/customer-engagement-data";
import { getDisplayName } from "@/utils/authUtils";
import { STAFF_ASSETS } from "@/lib/staff-assets";

const defaultLoyaltyInfo = {
  tierName: "Đồng",
  availablePoints: 0,
};

const TIER_COLORS = {
  "Đồng": "var(--tier-bronze)",
  "Bạc": "var(--tier-silver)",
  "Vàng": "var(--tier-gold)",
  "Bạch Kim": "var(--tier-platinum)",
  "Kim Cương": "var(--tier-diamond)",
};

const navLinks = [
  { icon: LayoutGrid, label: "Tổng quan", to: "/khach-hang", end: true },
  { icon: Calendar, label: "Lịch đặt của tôi", to: "/khach-hang/lich-dat", end: false },
  { icon: Car, label: "Xe của tôi", to: "/khach-hang/xe-cua-toi", end: false },
  { icon: CreditCard, label: "Thanh toán & hóa đơn", to: "/khach-hang/thanh-toan", end: false },
  { icon: Star, label: "Điểm thành viên", to: "/khach-hang/diem-thanh-vien", end: false },
  { icon: Gift, label: "Ưu đãi", to: "/khach-hang/uu-dai", end: false },
];

function resolveDisplayName() {
  return getDisplayName("Khách hàng");
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

function CustomerHeaderActions() {
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
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => navigate("/khach-hang/thong-bao")}
        title="Thông báo"
        aria-label="Thông báo"
        className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-surface hover:text-foreground"
      >
        <Bell size={18} />
      </button>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "flex cursor-pointer select-none items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 transition",
          showDropdown ? "border-primary/20 bg-primary-container" : "border-border bg-card hover:bg-surface",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white shadow">
          {getAvatarLetter()}
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <span className="text-left leading-tight">
            <span className="block text-xs font-bold text-foreground">{renderCustomerName()}</span>
            <span className="block text-xs font-semibold text-muted-foreground">Khách hàng</span>
          </span>
          <ChevronDown size={16} className={cn("text-neutral-muted transition-transform", showDropdown && "rotate-180")} />
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-border bg-popover p-2 shadow-floating">
          <div className="mb-1 border-b border-border px-3 py-2.5 md:hidden">
            <p className="text-sm font-bold text-foreground">{renderCustomerName()}</p>
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
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-primary-container hover:text-primary-strong"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-container text-primary"><Icon size={16} /></span>
              {label}
            </button>
          ))}
          <div className="my-1 h-px bg-muted" />
          <button
            type="button"
            onClick={() => { setShowDropdown(false); handleLogout(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-critical transition hover:bg-critical-container"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-critical-container text-critical"><LogOut size={16} /></span>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

/* Hạng thành viên — dữ liệu thật từ /api/loyalty/me, hiển thị ở đáy sidebar tối */
function LoyaltyFooterCard() {
  const loyalty = useLoyaltyInfo();
  const tierColor = TIER_COLORS[loyalty.tierName] || "var(--tier-bronze)";

  return (
    <NavLink
      to="/khach-hang/diem-thanh-vien"
      className="block rounded-xl px-2 py-2 transition-colors hover:bg-ink-soft"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: tierColor }}>
          <Star size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Hạng {loyalty.tierName}</p>
          <p className="truncate text-xs text-neutral-muted">
            {new Intl.NumberFormat("vi-VN").format(loyalty.availablePoints)} điểm khả dụng
          </p>
        </div>
      </div>
    </NavLink>
  );
}

export default function CustomerPortalLayout() {
  return (
    <PortalShell
      navLinks={navLinks}
      brand={{ title: "WashMate", subtitle: "Khu vực khách hàng", logoSrc: STAFF_ASSETS.logo.mark }}
      documentTitle="WashMate — Khách hàng"
      headerRight={<CustomerHeaderActions />}
      sidebarTop={
        <NavLink
          to="/khach-hang/dat-lich-moi"
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-primary-strong"
        >
          <Plus size={18} /> Đặt lịch rửa xe
        </NavLink>
      }
      sidebarFooter={<LoyaltyFooterCard />}
    />
  );
}
