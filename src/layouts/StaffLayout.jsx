import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { userApi } from "@/api/userApi";
import { garageApi } from "@/api/garageApi";
import { getAuthItem } from "@/utils/authUtils";
import PortalShell from "@/components/shared/PortalShell";
import { Button } from "@/components/ui/button";
import { STAFF_ASSETS } from "@/lib/staff-assets";

// Icon điều hướng từ bộ asset gốc washmate_staff_assets_package (SVG dạng tile).
// Component nhận { size } giống icon lucide để tương thích PortalShell.
function assetIcon(src) {
  function AssetIcon({ size = 18 }) {
    return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-md" />;
  }
  return AssetIcon;
}

const navLinks = [
  { icon: assetIcon(STAFF_ASSETS.nav.overview), label: "Tổng quan", to: "/nhan-vien", end: true },
  { icon: assetIcon(STAFF_ASSETS.nav.queue), label: "Hàng đợi", to: "/nhan-vien/hang-doi", end: false },
  { icon: assetIcon(STAFF_ASSETS.nav.calendar), label: "Lịch hôm nay", to: "/nhan-vien/danh-sach", end: false },
  { icon: assetIcon(STAFF_ASSETS.nav.search), label: "Tra cứu booking", to: "/staff/bookings", end: false },
  { icon: assetIcon(STAFF_ASSETS.nav.user), label: "Hồ sơ nhân viên", to: "/nhan-vien/profile", end: false },
];

function readStoredUser() {
  try {
    return JSON.parse(getAuthItem("currentUser") || "{}");
  } catch {
    return {};
  }
}

export default function StaffLayout() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [garages, setGarages] = useState([]);

  useEffect(() => {
    let mounted = true;
    userApi
      .getMe()
      .then((data) => { if (mounted) setMe(data); })
      .catch(() => {}); // giữ fallback từ storage, axiosClient tự xử lý 401
    garageApi
      .getAll()
      .then((data) => { if (mounted) setGarages(Array.isArray(data) ? data : []); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const stored = readStoredUser();
  const displayName = me?.fullName || stored?.fullName || stored?.name || "Nhân viên";
  const roleLabel = me?.role || "STAFF";
  const initial = displayName.charAt(0).toUpperCase() || "S";

  // Garage được phân công: garageIds từ /users/me, tên tra qua /v1/garages.
  const garageNames = useMemo(() => {
    const ids = me?.garageIds || [];
    if (!ids.length || !garages.length) return [];
    return ids
      .map((id) => garages.find((g) => String(g.id) === String(id))?.name)
      .filter(Boolean);
  }, [me, garages]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail", "washmate_user_role"]
        .forEach((k) => { sessionStorage.removeItem(k); localStorage.removeItem(k); });
    }
    navigate("/dang-nhap");
  }

  return (
    <PortalShell
      navLinks={navLinks}
      brand={{ title: "WashMate", subtitle: "Staff Portal", logoSrc: STAFF_ASSETS.logo.mark }}
      sidebarBackground={STAFF_ASSETS.banner.sidebar}
      documentTitle="WashMate — Nhân viên"
      contentClassName="p-4 sm:p-6"
      headerRight={
        <>
          {garageNames.map((name) => (
            <span
              key={name}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-primary-container px-3 py-1.5 text-xs font-bold text-primary-strong md:flex"
            >
              <img src={STAFF_ASSETS.context.locationPin} alt="" width={16} height={16} className="rounded" />
              {name}
            </span>
          ))}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-surface"
          >
            <img src={STAFF_ASSETS.action.bell} alt="" width={20} height={20} className="rounded-md" />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-1.5 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
              {initial}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight text-foreground">{displayName}</p>
              <p className="text-xs leading-tight text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </>
      }
      sidebarFooter={
        <>
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="flex items-center gap-1 text-xs text-neutral-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Đang làm việc
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-3 w-full border border-ink-soft text-xs text-border hover:bg-ink-soft hover:text-white"
          >
            <img src={STAFF_ASSETS.nav.logout} alt="" width={16} height={16} className="rounded" /> Đăng xuất
          </Button>
        </>
      }
    />
  );
}
