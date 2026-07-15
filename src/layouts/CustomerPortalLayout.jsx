import { useEffect, useMemo, useState, useRef } from "react";
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
import { garageApi } from "@/api/garageApi";
import { loyaltyApi } from "@/api/loyaltyApi";
import { notificationApi } from "@/api/notificationApi";
import { normalizeNotificationList } from "@/lib/customer-notification-data";
import { cn } from "@/lib/utils";
import { getDisplayName } from "@/utils/authUtils";
import { STAFF_ASSETS } from "@/lib/staff-assets";
import { TierBadge, tierLabel, tierTheme } from "@/components/customer-portal/tier-badge";
import {
  computeTierProgress,
  fetchLoyaltyByGarage,
} from "@/lib/customer-loyalty-data";
import { getStoredGarageId, onGarageChange } from "@/lib/loyalty-garage-selection";

const fmtPts = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

// Active state: KÍNH xanh trong mờ + viền/highlight + quầng sáng + thanh nhấn trái.
const CUSTOMER_NAV_ACTIVE =
  "bg-[color-mix(in_srgb,var(--primary)_80%,transparent)] text-white backdrop-blur-md ring-1 ring-inset ring-white/20 shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--primary)_55%,transparent),inset_0_1px_0_rgba(255,255,255,0.22)] hover:translate-x-1 motion-reduce:hover:translate-x-0 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-white/85";
const CUSTOMER_NAV_IDLE =
  "text-neutral-muted hover:translate-x-1 hover:bg-white/5 hover:text-white motion-reduce:hover:translate-x-0";

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
  const [all, setAll] = useState([]); // [{ garageId, totalPoints, tiers, account }]
  const [selectedId, setSelectedId] = useState(() => getStoredGarageId());

  useEffect(() => {
    async function fetchLoyalty() {
      try {
        // Cùng nguồn với trang Điểm thành viên → hạng ở sidebar luôn khớp gara đang chọn.
        const built = await fetchLoyaltyByGarage(garageApi, loyaltyApi);
        setAll(built);
      } catch {
        /* API lỗi → giữ rỗng, card hiện dạng mời tham gia */
      }
    }
    fetchLoyalty();
  }, []);

  // Đồng bộ với chi nhánh đang chọn ở trang Điểm thành viên.
  useEffect(() => onGarageChange((id) => setSelectedId(id)), []);

  return useMemo(() => {
    if (!all.length) return { account: null, tiers: [] };
    const bySel = selectedId != null && all.find((g) => String(g.garageId) === String(selectedId));
    if (bySel) return { account: bySel.account, tiers: bySel.tiers };
    // Mặc định: ladder hạng đầy đủ nhất → rồi tới điểm (khớp trang chính).
    const primary = [...all].sort((a, b) => {
      if (b.tiers.length !== a.tiers.length) return b.tiers.length - a.tiers.length;
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    })[0];
    return { account: primary.account, tiers: primary.tiers };
  }, [all, selectedId]);
}

function CustomerHeaderActions() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(resolveDisplayName);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleProfileUpdate() {
      setCustomerName(resolveDisplayName());
    }
    window.addEventListener("washmate-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("washmate-profile-updated", handleProfileUpdate);
  }, []);

  // Số thông báo chưa đọc — tải khi vào trang + khi quay lại tab (sau khi đọc ở trang thông báo).
  useEffect(() => {
    let alive = true;
    async function loadUnread() {
      try {
        const list = normalizeNotificationList(await notificationApi.getNotifications());
        if (alive) setUnread(list.filter((n) => !n.read).length);
      } catch {
        /* lỗi API → không hiện badge */
      }
    }
    loadUnread();
    const onFocus = () => loadUnread();
    window.addEventListener("focus", onFocus);
    window.addEventListener("washmate-notifications-updated", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("washmate-notifications-updated", onFocus);
    };
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
        title={unread > 0 ? `${unread} thông báo chưa đọc` : "Thông báo"}
        aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card/40 text-foreground shadow-card backdrop-blur-md backdrop-saturate-150 transition hover:bg-card/70"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-critical px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
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

/* Hạng thành viên — dữ liệu THẬT (đồng bộ trang Điểm thành viên): huy hiệu màu hạng + tiến độ */
function LoyaltyFooterCard() {
  const { account, tiers } = useLoyaltyInfo();

  if (!account) {
    return (
      <NavLink
        to="/khach-hang/diem-thanh-vien"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-primary-bright">
          <Star size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Điểm thành viên</p>
          <p className="truncate text-xs text-neutral-muted">Xem hạng & quyền lợi của bạn</p>
        </div>
      </NavLink>
    );
  }

  const theme = tierTheme(account.tierName);
  const progress = computeTierProgress(account, tiers);

  return (
    <div className="relative">
      {/* Quầng sáng màu hạng phía sau để lớp kính có gì để làm mờ (frosted thật) */}
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute -right-3 -top-4 size-24 rounded-full opacity-45 blur-2xl", theme.bar)}
      />
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute -bottom-5 left-2 size-20 rounded-full opacity-30 blur-2xl", theme.bar)}
      />

      <NavLink
        to="/khach-hang/diem-thanh-vien"
        className="wm-sidebar-glass relative block rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <TierBadge name={account.tierName} size="size-10" iconSize={20} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">Hạng {tierLabel(account.tierName)}</p>
            <p className="truncate text-xs text-white/70">{fmtPts(account.availablePoints)} điểm khả dụng</p>
          </div>
        </div>

        {progress.hasData && !progress.isMax && (
          <div className="mt-2.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className={cn("h-full rounded-full", theme.bar)} style={{ width: `${progress.progressPercent}%` }} />
            </div>
            <p className="mt-1.5 truncate text-[11px] font-semibold text-white/70">
              Còn <b className="text-white">{fmtPts(progress.pointsToNext)}</b> điểm để lên hạng {tierLabel(progress.next.name)}
            </p>
          </div>
        )}
        {progress.hasData && progress.isMax && (
          <p className="mt-2.5 text-[11px] font-semibold text-primary-bright">Bạn đang ở hạng cao nhất</p>
        )}
      </NavLink>
    </div>
  );
}

export default function CustomerPortalLayout() {
  return (
    // .wm-customer-type: hạ độ đậm chữ một bậc cho toàn khu khách hàng (index.css),
    // display:contents nên không ảnh hưởng layout.
    <div className="wm-customer-type">
    <PortalShell
      navLinks={navLinks}
      brand={{ title: "WashMate", subtitle: "", logoSrc: STAFF_ASSETS.logo.mark }}
      documentTitle="WashMate — Khách hàng"
      glassHeader
      navActiveClassName={CUSTOMER_NAV_ACTIVE}
      navIdleClassName={CUSTOMER_NAV_IDLE}
      sidebarClassName="wm-customer-sidebar"
      headerRight={<CustomerHeaderActions />}
      sidebarTop={
        <NavLink
          to="/khach-hang/dat-lich-moi"
          className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[color-mix(in_srgb,var(--primary)_82%,transparent)] px-3 py-3 text-sm font-bold text-white backdrop-blur-md shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--primary)_60%,transparent),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:bg-[color-mix(in_srgb,var(--primary)_92%,transparent)]"
        >
          <Plus size={18} /> Đặt lịch rửa xe
        </NavLink>
      }
      sidebarFooter={<LoyaltyFooterCard />}
    />
    </div>
  );
}
